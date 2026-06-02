#!/bin/bash
# -----------------------------------------------------------------------------
# JiuSpeak BJJ Platform - SSL PROVISIONER & RENEWING AUTOMATOR
# Target OS: Ubuntu 24.04 LTS
# -----------------------------------------------------------------------------

set -e

# Colors for clean visual output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===[ JiuSpeak SSL Setup Tool ]===${NC}"

# Check for root privilege
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Erro: Este script precisa ser executado como root. Use sudo ./setup-ssl.sh${NC}"
  exit 1
fi

# Request domain info
read -p "Digite o domínio da plataforma (ex: jiuspeak.seudominio.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
  echo -e "${RED}Erro: O domínio não pode ser vazio.${NC}"
  exit 1
fi

read -p "Digite seu e-mail para avisos sobre o SSL (ex: admin@seudominio.com): " EMAIL
if [ -z "$EMAIL" ]; then
  echo -e "${RED}Erro: O e-mail não pode ser vazio.${NC}"
  exit 1
fi

echo -e "\n${YELLOW}1. Atualizando repositório de pacotes...${NC}"
apt update -y

echo -e "\n${YELLOW}2. Verificando instalações necessárias (Certbot & Nginx plugin)...${NC}"
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Certbot não localizado, instalando...${NC}"
    apt install -y certbot python3-certbot-nginx
else
    echo -e "${GREEN}Certbot já instalado.${NC}"
fi

echo -e "\n${YELLOW}3. Solicitando certificados SSL à Let's Encrypt para o domínio: $DOMAIN...${NC}"
# Request SSL and automatically configure Nginx virtual host with SSL redirection
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect --keep-until-expiling

echo -e "\n${YELLOW}4. Validando e ajustando renovação automática semanal...${NC}"
# Certbot usually creates a systemd timer on Ubuntu. Let's make sure it's active.
systemctl status certbot.timer | grep Active || true

echo -e "\n${YELLOW}5. Executando simulação de renovação (Dry run) para validar as regras...${NC}"
certbot renew --dry-run

echo -e "\n${GREEN}✔ Configuração de SSL Concluída com sucesso!${NC}"
echo -e "${GREEN}As requisições HTTP agora serão redirecionadas automaticamente para HTTPS no seu domínio.${NC}"
echo -e "${YELLOW}Cronjob de renovação automática está configurado pelo próprio systemd do Certbot.${NC}"
