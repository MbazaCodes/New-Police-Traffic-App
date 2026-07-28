# Deployment Guide

This guide covers deploying the Tanzania Police Digital Platform to a VPS
using PM2 as the process manager. A Vercel deployment path is also
documented for preview/staging environments.

## 1. Prerequisites

- A VPS (2GB RAM minimum, 4GB recommended) running Ubuntu 22.04+
- PostgreSQL 15+ installed and configured (see `docs/database-setup.md`)
- Node.js 20+ and npm 10+ installed on the VPS
- PM2 process manager: `npm install -g pm2`
- Nginx (or Caddy) for reverse proxy and TLS termination
- A domain name with DNS pointing to the VPS IP
- TLS certificate (Let's Encrypt via certbot is free)

## 2. VPS deployment (production)

### 2.1 First-time setup

SSH into the VPS as the deploy user:

```bash
ssh deploy@<vps-ip>
mkdir -p /home/deploy/apps && cd /home/deploy/apps
git clone https://github.com/MbazaCodes/New-Police-Traffic-App.git police-app
cd police-app
npm ci --omit=dev
npm run build
```

Create the production env file:

```bash
cp .env.example .env.production
nano .env.production
# Fill in DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, etc.
```

### 2.2 PM2 ecosystem file

Create `ecosystem.config.js` in the project root:

```js
module.exports = {
  apps: [{
    name: "police-app",
    script: "node_modules/next/dist/bin/next",
    args: "start -p 3000",
    env: {
      NODE_ENV: "production",
    },
    env_file: ".env.production",
    instances: 1,
    autorestart: true,
    max_memory_restart: "1G",
    log_file: "/home/deploy/apps/police-app/logs/app.log",
    error_file: "/home/deploy/apps/police-app/logs/error.log",
    out_file: "/home/deploy/apps/police-app/logs/out.log",
    time: true,
  }],
};
```

Start the app:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # follow the printed instructions to enable auto-restart on boot
```

### 2.3 Nginx reverse proxy

Create `/etc/nginx/sites-available/police-app`:

```nginx
server {
    listen 80;
    server_name police.example.gov;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name police.example.gov;

    ssl_certificate     /etc/letsencrypt/live/police.example.gov/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/police.example.gov/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/police-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2.4 TLS certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d police.example.gov
```

Certbot will auto-renew via systemd timer.

### 2.5 Update deployment

The `scripts/deploy.sh` script automates the update flow:

```bash
./scripts/deploy.sh
```

It performs:

1. `git pull origin main`
2. `npm ci --omit=dev`
3. `npm run build`
4. `pm2 reload police-app`
5. Health check (`curl -f http://localhost:3000/api/health`)

On failure, it rolls back to the previous release and keeps the old
build directory for inspection.

## 3. Vercel deployment (preview/staging)

For preview branches and staging, Vercel is convenient. Push the branch
to GitHub and import the repo into Vercel.

Required env vars in Vercel project settings:

- `DATABASE_URL` — connection string to your VPS PostgreSQL
- `NEXTAUTH_SECRET` — generate a fresh secret for each environment
- `NEXTAUTH_URL` — the Vercel auto-generated URL
- `NEXT_PUBLIC_APP_URL` — same as `NEXTAUTH_URL`

Vercel handles TLS, CDN, and automatic deploys on every push. The free
tier is sufficient for staging; production should use the VPS path for
data-residency compliance.

## 4. Post-deploy verification

After deploying, verify:

1. `https://police.example.gov/api/health` returns `{"ok":true}`.
2. Login with a test officer account → dashboard loads.
3. Create a test citation → appears in the list.
4. Audit log entry is created for the citation.
5. Citizen portal at `/citizen` loads the PWA install prompt.

## 5. Rollback

To rollback to a previous release:

```bash
cd /home/deploy/apps/police-app
git log --oneline -10          # find the commit to rollback to
git checkout <commit>
npm ci --omit=dev
npm run build
pm2 reload police-app
```

Database migrations are NOT automatically rolled back. If a deploy
included a migration, you must manually write a down-migration.

## 6. Monitoring

- **PM2 logs**: `pm2 logs police-app --lines 100`
- **Nginx logs**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- **PostgreSQL logs**: `/var/log/postgresql/postgresql-15-main.log`
- **App logs**: `/home/deploy/apps/police-app/logs/`

For production monitoring, consider setting up Sentry (set
`NEXT_PUBLIC_SENTRY_DSN`) and UptimeRobot (or similar) for HTTP health
checks.
