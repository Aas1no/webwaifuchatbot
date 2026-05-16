# PersonaChat GitHub Webhook Server Package

This folder is for the server-side AI assistant/operator. It installs a GitHub webhook receiver so the server automatically updates the website after pushes to GitHub.

## What this sets up

- App repository: `https://github.com/Aas1no/webwaifuchatbot.git`
- App directory: `/opt/personachat/repo`
- Persistent data: `/opt/personachat/shared/data`
- App process: PM2 name `personachat`, port `8787`
- Webhook process: PM2 name `github-webhook`, local port `9000`
- Webhook path: `/github-webhook`

The webhook receiver listens on `127.0.0.1` by default. Put Nginx in front of it and expose:

```text
https://YOUR_DOMAIN/github-webhook
```

## Server AI task

Upload this whole `server-github-webhook` folder to the server, for example:

```bash
/tmp/server-github-webhook
```

Then run:

```bash
cd /tmp/server-github-webhook

export GITHUB_WEBHOOK_SECRET="$(openssl rand -hex 32)"
echo "Save this GitHub webhook secret: $GITHUB_WEBHOOK_SECRET"

export REPO_URL="https://github.com/Aas1no/webwaifuchatbot.git"
export BRANCH="main"
export DEPLOY_ROOT="/opt/personachat"
export APP_PORT="8787"
export WEBHOOK_PORT="9000"

bash ./install.sh
```

If the GitHub repo is private, configure a GitHub Deploy Key or token on the server before running the install script, then set `REPO_URL` to the SSH URL, for example:

```bash
export REPO_URL="git@github.com:Aas1no/webwaifuchatbot.git"
```

## Nginx

Add this location block inside the existing HTTPS `server { ... }` block for the site:

```nginx
location /github-webhook {
    proxy_pass http://127.0.0.1:9000/github-webhook;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Then reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

The installer also writes a copy to:

```text
/opt/personachat/nginx-location.conf
```

## GitHub webhook settings

In GitHub repository settings:

```text
Settings -> Webhooks -> Add webhook
```

Use:

```text
Payload URL: https://YOUR_DOMAIN/github-webhook
Content type: application/json
Secret: the exact GITHUB_WEBHOOK_SECRET generated above
SSL verification: Enable SSL verification
Events: Just the push event
Active: checked
```

## Test commands

On the server:

```bash
pm2 status
pm2 logs github-webhook
pm2 logs personachat
curl -fsS http://127.0.0.1:8787/api/health
```

After this is working, local updates are:

```powershell
git add .
git commit -m "Update website"
git push
```

The server will receive the GitHub webhook, pull `main`, and restart the website.

## Important notes

- Do not commit or publish `GITHUB_WEBHOOK_SECRET`.
- Do not delete `/opt/personachat/shared/data`; that is where account/session data is kept.
- If the app needs API keys, put them in `/opt/personachat/shared/.env`, for example:

```bash
DEEPSEEK_API_KEY=your_key_here
PORT=8787
PERSONACHAT_DATA_DIR=/opt/personachat/shared/data
```

