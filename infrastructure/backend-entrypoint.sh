#!/bin/sh
set -euo pipefail

cd /app

install_dependencies() {
  if [ -f pnpm-lock.yaml ]; then
    if ! command -v pnpm >/dev/null 2>&1; then
      if command -v corepack >/dev/null 2>&1; then
        corepack enable
      fi
    fi
    pnpm install --frozen-lockfile
  elif [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
}

run_migrations() {
  npm run migrate
}

maybe_seed() {
  if [ "${RUN_SEED:-false}" = "true" ]; then
    if [ -n "${SEED_FILE:-}" ]; then
      npm run seed -- "${SEED_FILE}"
    else
      npm run seed
    fi
  fi
}

start_application() {
  npm run "${START_COMMAND:-dev}"
}

install_dependencies
run_migrations
maybe_seed
start_application
