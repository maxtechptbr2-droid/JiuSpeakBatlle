# Guia de Implantação em Produção - Ubuntu 24.04 LTS
## JiuSpeak BJJ Platform

Este documento detalha o processo completo e profissional para implantar a plataforma **JiuSpeak** em um servidor limpo rodando **Ubuntu 24.04 LTS**.

---

## 🛠 Requisitos de Sistema Recomendados
- **SO**: Ubuntu 24.04 LTS (x86_64 ou ARM64)
- **CPU**: Mínimo 1 Core (Recomendado: 2 Cores ou mais para clustering PM2)
- **Memória**: Mínimo 2 GB RAM (com swap configurada)
- **Banco de Dados**: PostgreSQL 14, 15, ou 16
- **Cache / WebSocket State**: Redis (opcional, para escalabilidade horizontal)

---

## 🚀 Passo-a-Passo de Instalação

### 1. Atualização Geral e Instalação de Ferramentas Base

Primeiro, atualize todos os pacotes instalados no sistema e instale as ferramentas necessárias para compilação e segurança:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential ufw fail2ban certbot python3-certbot-nginx
```

---

### 2. Instalação e Preparação do Node.js (v22 - LTS)

Utilizaremos o NodeSource oficial para instalar a versão de suporte a longo prazo (LTS v22) do Node.js:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verifique as versões instaladas
node -v
npm -v
```

---

### 3. Instalação e Configuração do PostgreSQL

Instale o PostgreSQL oficial e configure o banco de dados principal e as credenciais de acesso:

```bash
sudo apt install -y postgresql postgresql-contrib

# Iniciar o serviço do PostgreSQL
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Acessar o console do Postgres
sudo -i -u postgres psql
```

Dentro do terminal do PostgreSQL (`psql`), execute os comandos para criar o usuário e o banco de dados:

```sql
-- Criar usuário com senha segura
CREATE USER jiuspeak_user WITH PASSWORD 'SuaSenhaSuperSeguraSubstituaAqui';

-- Criar o banco de dados principal
CREATE DATABASE jiuspeak_db OWNER jiuspeak_user;

-- Conceder todos os privilégios ao usuário
GRANT ALL PRIVILEGES ON DATABASE jiuspeak_db TO jiuspeak_user;

-- Sair do terminal
\q
```

---

### 4. Instalação do PM2 (Process Manager)

O PM2 gerencia nossos processos rodando em background e escalando com clusterização multinúcleo de forma automática.

```bash
sudo npm install -g pm2
```

---

### 5. Configuração do Código-Fonte e Prisma no Servidor

Clone seu repositório oficial na pasta do servidor, instale os pacotes de produção e crie os arquivos de ambiente:

```bash
mkdir -p /var/www/jiuspeak
cd /var/www/jiuspeak

# Importe o código da aplicação (ou baixe o arquivo comprimido do projeto)
# Instalar dependências exclusivas de deployment
npm install --omit=dev --legacy-peer-deps
```

Crie o arquivo de variáveis de ambiente `.env` de produção:

```bash
cat <<EOF > .env
NODE_ENV="production"
PORT=3000
DATABASE_URL="postgresql://jiuspeak_user:SuaSenhaSuperSeguraSubstituaAqui@localhost:5432/jiuspeak_db?schema=public"
JWT_SECRET="ColoqueUmSegredoHashMuitoForteAquiNinguemDeveSaber"
JWT_REFRESH_SECRET="ColoqueOutroSegredoHashMuitoForteDiferente"
GEMINI_API_KEY="AIzaSyYourProductionGeminiApiKeyGoesHere"
DISABLE_HMR=true
EOF
```

Execute as migrações automáticas da estrutura do Prisma ORM para sincronizar e semear perguntas base no banco:

```bash
# Executa e aplica o schema.prisma no banco de dados do Postgres
npx prisma migrate deploy

# Se houver comando de seed no package.json, execute:
npx prisma db seed
```

Realize o build compilando a aplicação com Vite e empacotando o Express Server:

```bash
npm run build
```

---

### 6. Inicialização com PM2 em Modo Cluster

Com o build completo no diretório `dist/`, iniciamos nosso aplicativo baseado no arquivo de configuração do PM2 que já incluímos na raiz do projeto:

```bash
# Iniciar a aplicação usando a configuração clusterizada
pm2 start ecosystem.config.cjs

# Adicionar PM2 à sequência de boot do sistema operacional (auto-inicialização se o servidor reiniciar)
pm2 startup systemd
```

*(Copie e cole a saída do terminal sugerida pelo comando acima para habilitar o comando de auto-inicialização).*

Salve a lista atual de processos do PM2 para recuperar os estados após reinicializações:

```bash
pm2 save
```

---

### 7. Configuração Virtual Host do Nginx e Certificação SSL

Use o template pré-configurado já presente na pasta para configurar o Nginx:

```bash
# Criar diretório de logs apropriado
sudo mkdir -p /var/www/jiuspeak/logs

# Copiar arquivo de configuração para o nginx do Ubuntu
sudo cp nginx/jiuspeak.conf /etc/nginx/sites-available/jiuspeak.conf

# Criar link simbólico para habilitar o site
sudo ln -sf /etc/nginx/sites-available/jiuspeak.conf /etc/nginx/sites-enabled/

# Desativar o virtual host default para evitar conflitos de portas
sudo rm -f /etc/nginx/sites-enabled/default

# Testar se o arquivo de configuração do Nginx é válido
sudo nginx -t

# Reiniciar o serviço do Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Configuração de SSL Seguro (Certbot Let's Encrypt)
Execute o script fornecido na raiz para instalar de forma guiada o Certbot, gerar o certificado SSL e atualizar de forma resiliente as configurações HTTPS:

```bash
sudo chmod +x scripts/setup-ssl.sh
sudo ./scripts/setup-ssl.sh
```

---

### 8. Integração e Configuração do Fail2ban (Anti Brute-Force)

Para evitar ataques de brute-force e inundação abusiva na API:

```bash
# Criar o filtro customizado JiuSpeak no fail2ban
sudo cp fail2ban/jiuspeak.conf /etc/fail2ban/filter.d/jiuspeak-auth.conf

# Se preferir usar o arquivo combinado, siga as instruções internas do file fail2ban/jiuspeak.conf:
# Crie o jail.d local usando este comando:
cat <<EOF | sudo tee /etc/fail2ban/jail.d/jiuspeak.local
[jiuspeak]
enabled  = true
port     = http,https
filter   = jiuspeak-auth
logpath  = /var/log/nginx/jiuspeak_access.log
backend  = auto
maxretry = 5
findtime = 600
bantime  = 3600
EOF

# Reiniciar e verificar o status do serviço fail2ban
sudo systemctl restart fail2ban
sudo fail2ban-client status jiuspeak
```

---

### 9. Políticas Resilientes de Backup e Disaster Recovery

Utilize os scripts automatizados fornecidos para salvaguardar e reverter dados.

#### Como Executar um Backup Manual:
```bash
sudo chmod +x scripts/backup-db.sh
sudo ./scripts/backup-db.sh
```

#### Como Configurar o Cron para Backups Diários às 02:00 da manhã:
```bash
sudo crontab -e
```
Insira a seguinte linha no final do arquivo cron editado:
```cron
0 2 * * * /bin/bash /var/www/jiuspeak/scripts/backup-db.sh > /dev/null 2>&1
```

#### Como Executar uma Restauração de Database Completa:
```bash
sudo chmod +x scripts/restore-db.sh
sudo ./scripts/restore-db.sh /var/backups/jiuspeak/jiuspeak_backup_2026-06-02_174919.sql.tar.gz
```

---

## 📊 Monitoramento de Produção e Auditoria de Log

### Verificar Performance & Métricas em tempo real do PM2:
O PM2 possui ferramentas ricas de telemetria diretamente integradas e visualizáveis no dashboard de terminal:
```bash
pm2 monit
```

### Inspecionar Transações de Logs do PM2 em tempo real:
```bash
pm2 logs jiuspeak-platform
```

### Consultar Registros de Auditorias do Banco de Dados:
Todas as ações críticas (logins, cadastros, transações financeiras PIX, saques pendentes, listagens ou transações do marketplace, e alterações de administradores) são gravadas perfeitamente na tabela `AuditLog` do PostgreSQL de forma segura e não-bloqueante.
Você pode visualizar esses registros diretamente no terminal ou na aba administrativa de logs da própria aplicação JiuSpeak.

Para ler os logs via psql a qualquer momento:
```sql
SELECT "createdAt", "action", "description", "ipAddress" FROM "AuditLog" ORDER BY "createdAt" DESC LIMIT 50;
```
