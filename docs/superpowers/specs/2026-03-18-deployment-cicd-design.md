# Deployment & CI/CD — Design Spec

## Overview

Deploy the Todo App to an EC2 instance with a blue-green deployment strategy. A GitHub Actions workflow, manually triggered, SSHs into EC2 and redeploys the `prod` branch with zero downtime.

## Infrastructure

- **EC2 Instance:** t2.micro (free tier), Amazon Linux 2023, `54.151.197.81`, region `ap-southeast-1`
- **SSH:** User `ec2-user`, key `ec2-claude-todo-key.pem`
- **Database:** PostgreSQL installed on the same EC2 instance
- **Process Manager:** PM2 (manages blue/green app instances)
- **Reverse Proxy:** Nginx (port 80 → active app port)
- **Node.js:** v20 LTS

## Blue-Green Deployment Strategy

Two app slots alternate between deployments:

| Slot  | Directory              | Port |
|-------|------------------------|------|
| Blue  | `/home/ec2-user/blue`  | 3000 |
| Green | `/home/ec2-user/green` | 3001 |

### Deploy Flow

1. Determine which slot is currently **inactive** (the target)
2. Pull latest `prod` branch into the target directory
3. Run `npm ci` and `npx prisma migrate deploy` and `npm run build`
4. Start the target app via PM2: `PORT=<port> pm2 start npm --name <slot> -- start`
5. Health check with retry: `curl --retry 10 --retry-delay 3 --fail http://localhost:<port>`
6. If healthy: `sed -i` to update port in Nginx upstream config, then `sudo nginx -s reload`
7. Stop the old slot's PM2 process: `pm2 stop <old-slot>`
8. Record the new active slot to `/home/ec2-user/active-slot`

### Rollback

If the health check fails, the target slot is stopped and the currently active slot continues serving traffic. No user impact.

### Active Slot Tracking

A file `/home/ec2-user/active-slot` contains either `blue` or `green` to track which slot is live.

## EC2 Setup (One-Time)

Install and configure on the instance:

1. **Swap file (2GB)** — required to prevent OOM during `npm run build` on t2.micro:
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```
2. **Node.js 20** via nvm
3. **PostgreSQL 16** — create database `claude_todo`, user `claude_todo` with password
4. **PM2** — `npm install -g pm2`
5. **Nginx** — reverse proxy port 80 → active app port
6. **Clone repo** into both `/home/ec2-user/blue` and `/home/ec2-user/green`
7. **Create shared `.env`** at `/home/ec2-user/.env` and symlink into both directories:
   ```bash
   ln -s /home/ec2-user/.env /home/ec2-user/blue/.env
   ln -s /home/ec2-user/.env /home/ec2-user/green/.env
   ```
8. **Initial deploy** — build and start blue slot, set `active-slot` to `blue`
9. **Security group** — open ports 22 (SSH), 80 (HTTP)

## GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml` (replaces existing Amplify deploy workflow)

**Trigger:** `workflow_dispatch` on `prod` branch (manual only)

```yaml
name: Deploy to EC2

on:
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/prod'
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: bash /home/ec2-user/deploy.sh
```

**GitHub Secrets Required:**
| Secret           | Value                                 |
|------------------|---------------------------------------|
| `EC2_HOST`       | `54.151.197.81`                       |
| `EC2_USER`       | `ec2-user`                            |
| `EC2_SSH_KEY`    | Contents of `ec2-claude-todo-key.pem` |

## Deploy Script

A bash script `/home/ec2-user/deploy.sh` on the EC2 instance:

```bash
#!/bin/bash
set -e

ACTIVE=$(cat /home/ec2-user/active-slot 2>/dev/null || echo "blue")

if [ "$ACTIVE" = "blue" ]; then
  TARGET="green"
  TARGET_PORT=3001
  OLD_PORT=3000
else
  TARGET="blue"
  TARGET_PORT=3000
  OLD_PORT=3001
fi

echo "=== Deploying to $TARGET (port $TARGET_PORT) ==="

# Pull latest code
cd /home/ec2-user/$TARGET
git pull origin prod

# Install and build
export NODE_OPTIONS="--max-old-space-size=512"
npm ci
npx prisma migrate deploy
npm run build

# Start target slot
pm2 stop $TARGET 2>/dev/null || true
pm2 delete $TARGET 2>/dev/null || true
PORT=$TARGET_PORT pm2 start npm --name $TARGET -- start

# Health check with retries
echo "=== Health checking $TARGET on port $TARGET_PORT ==="
curl --retry 10 --retry-delay 3 --fail http://localhost:$TARGET_PORT

# Switch Nginx to target
sudo sed -i "s/127.0.0.1:$OLD_PORT/127.0.0.1:$TARGET_PORT/" /etc/nginx/conf.d/app.conf
sudo nginx -s reload

# Stop old slot
pm2 stop $ACTIVE 2>/dev/null || true

# Record new active slot
echo "$TARGET" > /home/ec2-user/active-slot

echo "=== Deploy complete: $TARGET is now live on port $TARGET_PORT ==="
```

## Nginx Config

File: `/etc/nginx/conf.d/app.conf`

```nginx
upstream app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

The deploy script uses `sed -i` to swap the port number in the `upstream` block between `3000` and `3001`.

## Branch Flow (Updated)

```
develop (local dev) → merge to prod → GitHub Action available →
manually trigger "Run workflow" → deploy.sh runs on EC2 →
blue-green swap → zero-downtime deploy
```

## Environment Variables (EC2)

Shared `.env` file at `/home/ec2-user/.env`, symlinked into both blue and green directories:

| Variable         | Value                                                    |
|------------------|----------------------------------------------------------|
| `DATABASE_URL`   | `postgresql://claude_todo:<password>@localhost:5432/claude_todo` |
| `NEXTAUTH_SECRET`| Generated secret (32+ chars)                             |
| `NEXTAUTH_URL`   | `http://54.151.197.81`                                   |

## Updated Design Spec Sections

This spec supersedes the CI/CD and Deployment sections of `2026-03-17-todo-app-design.md` (which referenced `main` branch and AWS Amplify):

- **Hosting:** EC2 t2.micro (not Amplify)
- **Database:** PostgreSQL on EC2 (not RDS)
- **Deploy strategy:** Blue-green with PM2 + Nginx (not Amplify auto-deploy)
- **CI/CD trigger:** Manual `workflow_dispatch` on prod (not auto-deploy on push)
- **Branch target:** `prod` (not `main`)

## Out of Scope

- HTTPS / SSL certificates (no domain)
- Auto-scaling
- Monitoring / alerting
- Automated rollback beyond health check
- CI workflow changes (existing CI workflow unchanged)
