#!/usr/bin/env bash

# Secure exit rules
set -eo pipefail

BACKUP_DIR="/var/backups/jiuspeakbatlle"
RETENTION_DAYS=14
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ENV_FILE="/var/www/jiuspeakbatlle/.env"

echo "========================================================="
echo "   JIUSPEAK BJJ - DATABASE AUTOMATED ARCHIVAL ENGINE     "
echo "========================================================="
echo "Executing batch dump at: $(date)"

# Ensure backup path exists
mkdir -p "$BACKUP_DIR"

# Source environment variables to retrieve DATABASE_URL
if [ -f "$ENV_FILE" ]; then
    # Parse DATABASE_URL safely
    DATABASE_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d'="' -f2 | cut -d'"' -f1)
else
    echo "[-] Error: .env file not found at $ENV_FILE. Unable to identify database credentials."
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "[-] Error: DATABASE_URL parameter is empty in your configuration."
    exit 1
fi

# Target file name
BACKUP_FILENAME="jiuspeak_prod_$TIMESTAMP.sql.gz"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILENAME"

# 1. Database streaming dump with compression
echo "[+] Streaming PostgreSQL storage data out to secure partition..."
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_PATH"

# Verify backup file size is greater than zero
if [ -s "$BACKUP_PATH" ]; then
    echo "[+] Archive generated successfully: $BACKUP_PATH"
    echo "[+] Current size: $(du -sh "$BACKUP_PATH" | cut -f1)"
else
    echo "[-] Error: Database archive failed! Output file size is empty."
    rm -f "$BACKUP_PATH"
    exit 1
fi

# 2. Daily Rotation Cleanup
echo "[+] Checking for archives exceeding $RETENTION_DAYS days retention..."
find "$BACKUP_DIR" -type f -name "jiuspeak_prod_*.sql.gz" -mtime +$RETENTION_DAYS -exec rm -fv {} \;

echo "[+] Database backup operations complete."
exit 0
