#!/usr/bin/env bash
set -Eeuo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-/opt/personachat}"
REPO_DIR="${REPO_DIR:-$DEPLOY_ROOT/repo}"
BRANCH="${BRANCH:-main}"
APP_NAME="${APP_NAME:-personachat}"
APP_PORT="${APP_PORT:-8787}"
DATA_DIR="${DATA_DIR:-$DEPLOY_ROOT/shared/data}"
ENV_FILE="${ENV_FILE:-$DEPLOY_ROOT/shared/.env}"
LOCK_DIR="${LOCK_DIR:-$DEPLOY_ROOT/deploy.lock}"

need_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing command: $1" >&2
    exit 1
  fi
}

need_command git
need_command node
need_command pm2
need_command curl

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "Another deployment is already running. Skipping this delivery."
  exit 0
fi
trap 'rmdir "$LOCK_DIR"' EXIT

mkdir -p "$DATA_DIR"

cd "$REPO_DIR"

echo "Fetching origin/$BRANCH ..."
git fetch origin "$BRANCH"

local_rev="$(git rev-parse HEAD)"
remote_rev="$(git rev-parse "origin/$BRANCH")"

if [ "$local_rev" = "$remote_rev" ]; then
  echo "Already up to date at $local_rev."
else
  echo "Updating $local_rev -> $remote_rev ..."
  git pull --ff-only origin "$BRANCH"
fi

ln -sfnT "$DATA_DIR" "$REPO_DIR/.personachat-data"
if [ -f "$ENV_FILE" ]; then
  ln -sfnT "$ENV_FILE" "$REPO_DIR/.env"
fi

if node -e 'const p=require("./package.json"); const deps=Object.keys(p.dependencies||{}).length+Object.keys(p.optionalDependencies||{}).length; process.exit(deps ? 0 : 1)' >/dev/null 2>&1; then
  if [ -f package-lock.json ]; then
    npm ci --omit=dev
  else
    npm install --omit=dev --package-lock=false
  fi
fi

export PORT="$APP_PORT"
export PERSONACHAT_DATA_DIR="$DATA_DIR"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  pm2 start server.js --name "$APP_NAME" --update-env
fi

health_url="http://127.0.0.1:${PORT:-$APP_PORT}/api/health"
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if health_json="$(curl -fsS "$health_url" 2>/dev/null)"; then
    echo "Health check OK: $health_json"
    exit 0
  fi
  sleep 1
done

echo "Deploy finished, but health check failed at $health_url" >&2
exit 1

