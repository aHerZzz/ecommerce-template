#!/bin/sh
set -euo pipefail

cd /app

USE_PNPM=false

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
run_migrations
maybe_seed
start_application
