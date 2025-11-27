#!/bin/sh
set -euo pipefail

cd /app

USE_PNPM=false
BASE_DIR="/app"
ENV_FILE_LABEL=".env"
RUNNING_IN_CONTAINER=false
RUNNING_ON_LOCALHOST=true

if [ -f "/.dockerenv" ]; then
  RUNNING_IN_CONTAINER=true
  RUNNING_ON_LOCALHOST=false
fi

resolve_relative() {
  case "$1" in
  /*)
    printf "%s\n" "$1"
    ;;
  *)
    printf "%s/%s\n" "$BASE_DIR" "$1"
    ;;
  esac
}

resolve_env_file() {
  if [ -n "${ENV_FILE:-}" ]; then
    resolve_relative "$ENV_FILE"
    return
  fi

  if [ "$RUNNING_ON_LOCALHOST" = true ]; then
    for candidate in .env.host.local .env.host; do
      resolved="$(resolve_relative "$candidate")"
      if [ -f "$resolved" ]; then
        MEDUSA_ENV=${MEDUSA_ENV:-host}
        printf "%s\n" "$resolved"
        return
      fi
    done
  fi

  if [ -n "${MEDUSA_ENV:-}" ]; then
    resolve_relative ".env.${MEDUSA_ENV}"
    return
  fi

  resolve_relative ".env"
}

if ENV_FILE_PATH="$(resolve_env_file)"; then
  if [ -f "$ENV_FILE_PATH" ]; then
    ENV_FILE_LABEL="${ENV_FILE_PATH#$BASE_DIR/}"
    if [ "$ENV_FILE_LABEL" = "$ENV_FILE_PATH" ]; then
      ENV_FILE_LABEL="$ENV_FILE_PATH"
    fi

    echo "Loading environment from $ENV_FILE_LABEL"
    set -a
    # shellcheck source=/dev/null
    . "$ENV_FILE_PATH"
    set +a
  else
    ENV_FILE_LABEL="${ENV_FILE_PATH#$BASE_DIR/}"
    echo "Environment file $ENV_FILE_LABEL not found; relying on existing environment"
  fi
else
  echo "Unable to resolve environment file"
  exit 1
fi

points_to_docker_network_host() {
  url="$1"

  if [ -z "$url" ]; then
    return 1
  fi

  host=$(printf '%s' "$url" | sed -n 's#^[^:/]*://\([^/@:]*\).*#\1#p')

  if [ "$host" = "db" ] || [ "$host" = "redis" ]; then
    return 0
  fi

  printf '%s' "$url" | grep -Eq '@db[:/]|://db[:/]|redis://redis[:/]' && return 0

  return 1
}

if { points_to_docker_network_host "${DATABASE_URL:-}" || points_to_docker_network_host "${REDIS_URL:-}"; } \
  && [ "$RUNNING_ON_LOCALHOST" = true ]; then
  echo "Refusing to load ${ENV_FILE_LABEL} because it points to Docker-only hosts (db/redis). Set ENV_FILE=./.env.host or ./apps/backend/.env.host.local when running on the host." >&2
  exit 1
fi

MISSING_ENV_VARS=""

if [ -z "${DATABASE_URL:-}" ]; then
  MISSING_ENV_VARS="DATABASE_URL"
fi

if [ -z "${REDIS_URL:-}" ]; then
  if [ -n "$MISSING_ENV_VARS" ]; then
    MISSING_ENV_VARS="$MISSING_ENV_VARS, "
  fi
  MISSING_ENV_VARS="${MISSING_ENV_VARS}REDIS_URL"
fi

if [ -n "$MISSING_ENV_VARS" ]; then
  echo "Missing $MISSING_ENV_VARS after loading ${ENV_FILE_LABEL}. Define MEDUSA_ENV=host to load apps/backend/.env.host(.local) or set ENV_FILE to point at the right file." >&2
  exit 1
fi

ensure_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    return
  fi

  if command -v corepack >/dev/null 2>&1; then
    corepack enable
  fi
}

install_dependencies() {
  if [ -f pnpm-lock.yaml ]; then
    USE_PNPM=true
    ensure_pnpm
    pnpm install --frozen-lockfile
  elif command -v pnpm >/dev/null 2>&1; then
    USE_PNPM=true
    ensure_pnpm
    pnpm install
  elif [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
}

run_script() {
  if [ "$USE_PNPM" = true ]; then
    pnpm run "$@"
  else
    npm run "$@"
  fi
}

run_migrations() {
  run_script migrate
}

check_postgres_connection() {
  DATABASE_URL="${DATABASE_URL:-}" ENV_FILE_LABEL="$ENV_FILE_LABEL" node <<'NODE'
import { Client } from "pg";

const url = process.env.DATABASE_URL;
const envFileLabel = process.env.ENV_FILE_LABEL;

const buildConnectionErrorMessage = (targetUrl) =>
  `Cannot reach ${targetUrl} — did you load ${envFileLabel}?`;

const client = new Client({
  connectionString: url,
  connectionTimeoutMillis: 3000,
});

(async () => {
  try {
    await client.connect();
    await client.query("SELECT 1");
  } catch (error) {
    console.error(error);
    console.error(buildConnectionErrorMessage(url));
    process.exit(1);
  } finally {
    await client.end().catch(() => undefined);
  }
})();
NODE
}

check_redis_connection() {
  REDIS_URL="${REDIS_URL:-}" ENV_FILE_LABEL="$ENV_FILE_LABEL" node <<'NODE'
import { createClient } from "redis";

const url = process.env.REDIS_URL;
const envFileLabel = process.env.ENV_FILE_LABEL;

const buildConnectionErrorMessage = (targetUrl) =>
  `Cannot reach ${targetUrl} — did you load ${envFileLabel}?`;

const client = createClient({
  url,
  socket: {
    connectTimeout: 3000,
    reconnectStrategy: () => new Error("Redis reconnection disabled for startup check"),
  },
});

(async () => {
  try {
    await client.connect();
    await client.ping();
  } catch (error) {
    console.error(error);
    console.error(buildConnectionErrorMessage(url));
    process.exit(1);
  } finally {
    await client.quit().catch(() => undefined);
  }
})();
NODE
}

check_connections() {
  check_postgres_connection
  check_redis_connection
}

maybe_seed() {
  if [ "${RUN_SEED:-false}" = "true" ]; then
    if [ -n "${SEED_FILE:-}" ]; then
      npm_config_file="${SEED_FILE}" run_script seed
    else
      run_script seed
    fi
  fi
}

start_application() {
  run_script "${START_COMMAND:-dev}"
}

install_dependencies
check_connections
run_migrations
maybe_seed
start_application
