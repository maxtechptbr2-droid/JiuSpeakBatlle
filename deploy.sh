#!/usr/bin/env bash

# Close on error and log pipe failures
set -eo pipefail

APP_DIR="/var/www/jiuspeakbatlle"
API_URL="http://127.0.0.1:3000/api/health"
RETRIES=10
DELAY=3

echo "========================================================="
echo "   JIUSPEAK BJJ - PRODUCTION ZERO-DOWNTIME DEPLOYMENT   "
echo "========================================================="
echo "Started at: $(date)"

# 1. Pre-flight Checks
if [ ! -d "$APP_DIR" ]; then
    echo "[-] Error: Directory $APP_DIR does not exist."
    exit 1
fi

cd "$APP_DIR"

# Ensure log directory exists
mkdir -p logs

# Save current git commit hash for potential rollback
PREVIOUS_COMMIT=$(git rev-parse HEAD)

echo "[+] Checking environment configuration files..."
if [ ! -f ".env" ]; then
    echo "[-] Error: .env file is missing in $APP_DIR. Cannot proceed safely."
    exit 1
fi

# 2. Update code from Remote Repository
echo "[+] Pulling latest software releases..."
git fetch origin
git merge origin/main

# 3. Secure Dependency Installation
echo "[+] Syncing packages and external modules..."
npm ci --prefer-offline --no-audit

# 4. Prisma Integration & Database Migrations
echo "[+] Checking database schema drift and running migrations..."
npx prisma validate
npx prisma generate
npx prisma migrate deploy

# 5. Compile Full-Stack Bundle
echo "[+] Bundling assets, frontend UI, and server.ts with esbuild..."
npm run build

# 6. PM2 Hot Zero-Downtime Reload
echo "[+] Reloading PM2 processes on cluster topology..."
if pm2 list | grep -q "jiuspeak-bjj-production"; then
    echo "[+] Application is running. Triggering rolling reload..."
    pm2 reload ecosystem.config.cjs --update-env
else
    echo "[+] Application is offline. Initiating cold start..."
    pm2 start ecosystem.config.cjs
fi

# 7. Post-Deployment Automated Health Assessment
echo "[+] Initiating liveness assessment polling on: $API_URL"
SUCCESS=false

for ((i=1; i<=RETRIES; i++)); do
    echo "Attempt $i/$RETRIES: Verifying instance cluster health..."
    if curl --silent --fail "$API_URL" > /dev/null; then
        echo "[+] Success: Instance cluster is active, responsive, and serving requests!"
        SUCCESS=true
        break
    else
        echo "[-] Instance did not reply successfully. Waiting $DELAY seconds..."
        sleep "$DELAY"
    fi
done

# 8. Deciding outcome / Fallback triggers
if [ "$SUCCESS" = true ]; then
    echo "[+] Zero-downtime deployment finished successfully at $(date)!"
    pm2 save
    exit 0
else
    echo "[-] Warning: Health check failed! Initializing emergency automatic rollback..."
    
    # Reverting source code
    git reset --hard "$PREVIOUS_COMMIT"
    
    # Rebuilding and reloading the previous safe state
    npm ci --prefer-offline --no-audit
    npx prisma generate
    npm run build
    pm2 reload ecosystem.config.cjs --update-env
    
    echo "[-] Rollback sequence complete. System is stable at revision $PREVIOUS_COMMIT."
    exit 1
fi
