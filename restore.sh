#!/usr/bin/env bash

# Secure exit rules
set -eo pipefail

ENV_FILE="/var/www/jiuspeakbatlle/.env"

echo "========================================================="
echo "   JIUSPEAK BJJ - DATABASE DISASTER RECOVERY PROTOCOL    "
echo "========================================================="

# Validate argument inputs
if [ -z "$1" ]; then
    echo "[-] Error: You must supply the absolute path to the .sql.gz target backup file."
    echo "Usage: ./restore.sh /var/backups/jiuspeakbatlle/jiuspeak_prod_YYYYMMDD_HHMMSS.sql.gz"
    exit 1
fi

RESTORE_FILE="$1"

if [ ! -f "$RESTORE_FILE" ]; then
    echo "[-] Error: Specified archive file does not exist: $RESTORE_FILE"
    exit 1
fi

# Find database coordinates
if [ -f "$ENV_FILE" ]; then
    DATABASE_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d'="' -f2 | cut -d'"' -f1)
else
    echo "[-] Error: Configuration .env file not found."
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "[-] Error: DATABASE_URL is not set in your config."
    exit 1
fi

# Extract DB name from the URL safely for connection termination
DB_NAME=$(echo "$DATABASE_URL" | grep -oE '/([^?/]+)(\?|$)' | cut -d'/' -f2 | cut -d'?' -f1 || echo "")

# Warn and get user authorization
echo "---------------------------------------------------------"
echo " WARNING: This operation will completely OVERWRITE"
echo " the content of the target production database."
echo "---------------------------------------------------------"
read -p "Type 'CONFIRM' to execute recovery: " CONFIRMATION

if [ "$CONFIRMATION" != "CONFIRM" ]; then
    echo "[-] Recovery sequence canceled by administrator."
    exit 0
fi

echo "[+] Terminating incoming backend connection sockets..."
if [ -n "$DB_NAME" ]; then
    # Parse connection string variables to run pg_terminate_backend, or run via database client control
    # Using DATABASE_URL connection context directly to disconnect other backends
    psql "$DATABASE_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" || echo "[i] Skipped backend connection disconnect step."
fi

echo "[+] Purging active db schemas..."
psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "[+] Running transactional database restoration in progress..."
gunzip -c "$RESTORE_FILE" | psql "$DATABASE_URL"

echo "[+] Database recovery completed successfully at: $(date)!"
exit 0
