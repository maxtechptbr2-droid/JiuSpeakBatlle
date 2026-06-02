#!/bin/bash
# -----------------------------------------------------------------------------
# JiuSpeak BJJ Platform - DATABASE SNAPSHOT RESTORER
# Target OS: Ubuntu 24.04 LTS (PostgreSQL)
# -----------------------------------------------------------------------------

set -e

# Configs
DB_NAME=${DB_NAME:-"jiuspeak_db"}
DB_USER=${DB_USER:-"postgres"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
TEMP_EXTRACT_DIR="/tmp/postgres_restore"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}===[ JiuSpeak PostgreSQL Restore Utility ]===${NC}"

# Check for argument
if [ -z "$1" ]; then
    echo -e "${RED}Erro: Você precisa prover o caminho completo do arquivo de backup (.tar.gz).${NC}"
    echo -e "${YELLOW}Exemplo: ./restore-db.sh /var/backups/jiuspeak/jiuspeak_backup_2026-06-02.tar.gz${NC}"
    exit 1
fi

BACKUP_FILE_PATH="$1"

if [ ! -f "$BACKUP_FILE_PATH" ]; then
    echo -e "${RED}Erro: Arquivo de backup não existe: $BACKUP_FILE_PATH${NC}"
    exit 1
fi

echo -e "${RED}⚠ ATENÇÃO! Este processo irá sobrescrever TODOS os dados existentes no banco: $DB_NAME. ⚠${NC}"
read -p "Deseja realmente continuar? (S/N): " CONFIRMATION
if [[ ! "$CONFIRMATION" =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}Restauração cancelada pelo administrador.${NC}"
    exit 0
fi

mkdir -p "$TEMP_EXTRACT_DIR"

echo -e "${YELLOW}1. Extraindo backup comprimido...${NC}"
tar -xzf "$BACKUP_FILE_PATH" -C "$TEMP_EXTRACT_DIR"

# Encontrar o arquivo .sql extraído
SQL_FILE=$(find "$TEMP_EXTRACT_DIR" -name "*.sql")
if [ -z "$SQL_FILE" ]; then
    echo -e "${RED}Erro: Não foi localizado nenhum arquivo .sql dentro de seu arquivo compactado.${NC}"
    rm -rf "$TEMP_EXTRACT_DIR"
    exit 1
fi

echo -e "${YELLOW}2. Terminando conexões ativas na tabela para evitar travamento de conexões (Lock)...${NC}"
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$DB_NAME'
  AND pid <> pg_backend_pid();"

echo -e "${YELLOW}3. Recriando banco de dados limpo para importação ($DB_NAME)...${NC}"
# Recreate database to ensure a clean slate
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "DROP DATABASE IF EXISTS $DB_NAME;"
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "CREATE DATABASE $DB_NAME;"

echo -e "${YELLOW}4. Restaurando dados via pipeline Postgres psql...${NC}"
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✔ Banco de dados PostgreSQL restaurado perfeitamente!${NC}"
else
    echo -e "${RED}❌ Falha crítica reportada durante a reinserção do banco de dados!${NC}"
fi

# Cleanup
rm -rf "$TEMP_EXTRACT_DIR"
echo -e "${GREEN}✔ Limpeza de arquivos temporários concluída.${NC}"
