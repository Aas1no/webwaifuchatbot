#!/usr/bin/env bash
set -Eeuo pipefail

: "${DEPLOY_PATH:?DEPLOY_PATH is required}"
: "${UPLOAD_ZIP:?UPLOAD_ZIP is required}"

APP_PORT="${APP_PORT:-8787}"
RESTART_MODE="${RESTART_MODE:-pm2}"
PM2_NAME="${PM2_NAME:-personachat}"
SYSTEMD_SERVICE="${SYSTEMD_SERVICE:-personachat}"
DATA_DIR="${DATA_DIR:-$DEPLOY_PATH/shared/data}"
ENV_FILE="${ENV_FILE:-$DEPLOY_PATH/shared/.env}"

need_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing command: $1" >&2
    exit 1
  fi
}

need_command unzip
need_command node

release_id="$(date +%Y%m%d-%H%M%S)"
releases_dir="$DEPLOY_PATH/releases"
shared_dir="$DEPLOY_PATH/shared"
release_dir="$releases_dir/$release_id"

mkdir -p "$release_dir" "$shared_dir" "$DATA_DIR" "$shared_dir/logs"

unzip -q "$UPLOAD_ZIP" -d "$release_dir"
rm -f "$UPLOAD_ZIP"

cd "$release_dir"

if [ -f package.json ]; then
  if node -e 'const p=require("./package.json"); const deps=Object.keys(p.dependencies||{}).length+Object.keys(p.optionalDependencies||{}).length; process.exit(deps ? 0 : 1)' >/dev/null 2>&1; then
    if [ -f package-lock.json ]; then
      npm ci --omit=dev
    else
      npm install --omit=dev --package-lock=false
    fi
  fi
fi

ln -sfn "$DATA_DIR" "$release_dir/.personachat-data"
if [ -f "$ENV_FILE" ]; then
  ln -sfn "$ENV_FILE" "$release_dir/.env"
fi

if [ -e "$DEPLOY_PATH/current" ] && [ ! -L "$DEPLOY_PATH/current" ]; then
  echo "$DEPLOY_PATH/current exists and is not a symlink. Move it aside before using this release layout." >&2
  exit 1
fi

ln -sfn "$release_dir" "$DEPLOY_PATH/current"
cd "$DEPLOY_PATH/current"

export PORT="$APP_PORT"
export PERSONACHAT_DATA_DIR="$DATA_DIR"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

health_check_enabled="true"

case "$RESTART_MODE" in
  pm2)
    need_command pm2
    if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
      pm2 restart "$PM2_NAME" --update-env
    else
      pm2 start server.js --name "$PM2_NAME" --update-env
    fi
    pm2 save >/dev/null 2>&1 || true
    ;;
  systemd)
    need_command systemctl
    sudo systemctl restart "$SYSTEMD_SERVICE"
    ;;
  none)
    echo "Files switched to $DEPLOY_PATH/current. Restart your service manually."
    health_check_enabled="false"
    ;;
  *)
    echo "Unknown RESTART_MODE: $RESTART_MODE" >&2
    exit 1
    ;;
esac

health_url="http://127.0.0.1:$PORT/api/health"
if [ "$health_check_enabled" = "false" ]; then
  echo "Health check skipped because RESTART_MODE is none."
  exit 0
elif command -v curl >/dev/null 2>&1; then
  for _ in 1 2 3 4 5; do
    if health_json="$(curl -fsS "$health_url" 2>/dev/null)"; then
      echo "Health check OK: $health_json"
      exit 0
    fi
    sleep 1
  done

  echo "Deploy finished, but health check failed at $health_url" >&2
  exit 1
fi

echo "Deploy finished. Health check skipped because curl is not installed."
