#!/bin/bash
# -----------------------------------------------------------------------------
# JiuSpeak BJJ Platform - AUTOMATED POSTGRESQL BACKUP SYSTEM
# Target OS: Ubuntu 24.04 LTS (PostgreSQL 14/15/16)
# -----------------------------------------------------------------------------

# --- CONFIGURAÇÃO ---
DB_NAME=${DB_NAME:-"jiuspeak_db"}
DB_USER=${DB_USER:-"postgres"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
BACKUP_DIR="/var/backups/jiuspeak"
RETENTION_DAYS=14 # Retenção máxima de 14 dias
DATE=$(date +%Y-%m-%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/jiuspeak_backup_$DATE.sql"
LOG_FILE="$BACKUP_DIR/backup.log"

# Cores para terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}===[ Iniciando Backup do PostgreSQL JiuSpeak ]===${NC}"

# Garantir a existência do diretório de backups
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    chmod 700 "$BACKUP_DIR"
    echo "Diretório de backups criado em: $BACKUP_DIR" >> "$LOG_FILE"
fi

# Validar ferramentas antes de rodar
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}Erro: pg_dump (PostgreSQL CLI tools) não foi encontrado.${NC}"
    echo "CRITICAL: pg_dump não encontrado no sistema" >> "$LOG_FILE"
    exit 1
fi

echo -e "${YELLOW}Realizando dump do banco de dados: $DB_NAME...${NC}"
# Execução do dump
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${YELLOW}Compactando o arquivo dump gerado...${NC}"
    tar -czf "$BACKUP_FILE.tar.gz" -C "$BACKUP_DIR" "jiuspeak_backup_$DATE.sql"
    rm "$BACKUP_FILE" # Remove dump não comprimido para economizar espaço
    
    echo -e "${GREEN}✔ Backup realizado com sucesso: $BACKUP_FILE.tar.gz${NC}"
    echo "SUCCESS: $DATE - Backup salvo como jiuspeak_backup_$DATE.sql.tar.gz" >> "$LOG_FILE"
else
    echo -e "${RED}❌ Erro durante a geração do dump do PostgreSQL !${NC}"
    echo "ERROR: $DATE - Falha crítica no dump." >> "$LOG_FILE"
    exit 1
fi

# --- POLÍTICA DE RETENÇÃO ---
echo -e "${YELLOW}Limpando backups expirados (retenção de $RETENTION_DAYS dias)...${NC}"
find "$BACKUP_DIR" -name "jiuspeak_backup_*.tar.gz" -mtime +$RETENTION_DAYS -exec rm {} \;
echo "INFO: $DATE - Limpeza de arquivos expirados completada." >> "$LOG_FILE"

echo -e "${GREEN}✔ Processo de Backup encerra de forma bem sucedida!${NC}"
