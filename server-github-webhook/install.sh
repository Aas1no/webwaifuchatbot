#!/usr/bin/env bash
set -Eeuo pipefail

REPO_URL="${REPO_URL:-https://github.com/Aas1no/webwaifuchatbot.git}"
BRANCH="${BRANCH:-main}"
DEPLOY_ROOT="${DEPLOY_ROOT:-/opt/personachat}"
REPO_DIR="${REPO_DIR:-$DEPLOY_ROOT/repo}"
APP_NAME="${APP_NAME:-personachat}"
APP_PORT="${APP_PORT:-8787}"
WEBHOOK_NAME="${WEBHOOK_NAME:-github-webhook}"
WEBHOOK_PORT="${WEBHOOK_PORT:-9000}"
WEBHOOK_HOST="${WEBHOOK_HOST:-127.0.0.1}"
WEBHOOK_PATH="${WEBHOOK_PATH:-/github-webhook}"
DATA_DIR="${DATA_DIR:-$DEPLOY_ROOT/shared/data}"
ENV_FILE="${ENV_FILE:-$DEPLOY_ROOT/shared/.env}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_SCRIPT="$DEPLOY_ROOT/deploy-from-git.sh"
WEBHOOK_SCRIPT="$DEPLOY_ROOT/github-webhook.js"

if [ -z "${GITHUB_WEBHOOK_SECRET:-}" ]; then
  echo "GITHUB_WEBHOOK_SECRET is required. Example:" >&2
  echo "  export GITHUB_WEBHOOK_SECRET=\"\$(openssl rand -hex 32)\"" >&2
  exit 1
fi

need_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing command: $1" >&2
    exit 1
  fi
}

mkdir_owned() {
  if mkdir -p "$@" 2>/dev/null; then
    return
  fi

  if command -v sudo >/dev/null 2>&1; then
    sudo mkdir -p "$@"
    sudo chown -R "$(id -u):$(id -g)" "$DEPLOY_ROOT"
    return
  fi

  echo "Could not create directories under $DEPLOY_ROOT. Run as root or install sudo." >&2
  exit 1
}

install_file_owned() {
  local mode="$1"
  local src="$2"
  local dest="$3"

  if install -m "$mode" "$src" "$dest" 2>/dev/null; then
    return
  fi

  if command -v sudo >/dev/null 2>&1; then
    sudo install -m "$mode" "$src" "$dest"
    sudo chown "$(id -u):$(id -g)" "$dest"
    return
  fi

  echo "Could not install $dest. Run as root or install sudo." >&2
  exit 1
}

need_command git
need_command node
need_command npm
need_command curl

if ! command -v pm2 >/dev/null 2>&1; then
  echo "Installing PM2 ..."
  if npm install -g pm2; then
    true
  elif command -v sudo >/dev/null 2>&1; then
    sudo npm install -g pm2
  else
    echo "Could not install PM2. Run as root or install sudo." >&2
    exit 1
  fi
fi

mkdir_owned "$DEPLOY_ROOT" "$DEPLOY_ROOT/shared" "$DATA_DIR" "$DEPLOY_ROOT/logs"

install_file_owned 0755 "$SCRIPT_DIR/deploy-from-git.sh" "$DEPLOY_SCRIPT"
install_file_owned 0644 "$SCRIPT_DIR/github-webhook.js" "$WEBHOOK_SCRIPT"

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "Cloning $REPO_URL into $REPO_DIR ..."
  git clone --branch "$BRANCH" "$REPO_URL" "$REPO_DIR"
else
  echo "Updating existing repository at $REPO_DIR ..."
  cd "$REPO_DIR"
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH"
fi

cd "$REPO_DIR"

if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" <<EOF
PORT=$APP_PORT
PERSONACHAT_DATA_DIR=$DATA_DIR
# DEEPSEEK_API_KEY=
# OPENAI_API_KEY=
# QWEN_API_KEY=
EOF
  chmod 600 "$ENV_FILE"
fi

ln -sfnT "$DATA_DIR" "$REPO_DIR/.personachat-data"
ln -sfnT "$ENV_FILE" "$REPO_DIR/.env"

if node -e 'const p=require("./package.json"); const deps=Object.keys(p.dependencies||{}).length+Object.keys(p.optionalDependencies||{}).length; process.exit(deps ? 0 : 1)' >/dev/null 2>&1; then
  if [ -f package-lock.json ]; then
    npm ci --omit=dev
  else
    npm install --omit=dev --package-lock=false
  fi
fi

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

export PORT="${PORT:-$APP_PORT}"
export PERSONACHAT_DATA_DIR="$DATA_DIR"

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  pm2 start server.js --name "$APP_NAME" --update-env
fi

cat > "$DEPLOY_ROOT/nginx-location.conf" <<EOF
location $WEBHOOK_PATH {
    proxy_pass http://127.0.0.1:$WEBHOOK_PORT$WEBHOOK_PATH;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
}
EOF

export GITHUB_WEBHOOK_SECRET
export DEPLOY_SCRIPT
export REPO_DIR
export BRANCH
export APP_NAME
export APP_PORT
export DATA_DIR
export ENV_FILE
export WEBHOOK_HOST
export WEBHOOK_PORT
export WEBHOOK_PATH

if pm2 describe "$WEBHOOK_NAME" >/dev/null 2>&1; then
  pm2 restart "$WEBHOOK_NAME" --update-env
else
  pm2 start "$WEBHOOK_SCRIPT" --name "$WEBHOOK_NAME" --update-env
fi

pm2 save >/dev/null 2>&1 || true

echo "Install complete."
echo "App health:"
curl -fsS "http://127.0.0.1:$APP_PORT/api/health"
echo
echo "Nginx location snippet: $DEPLOY_ROOT/nginx-location.conf"
echo "GitHub Payload URL should be: https://YOUR_DOMAIN$WEBHOOK_PATH"

