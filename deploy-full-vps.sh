#!/bin/bash

# Script de Deploy Final - Estrutura Centralizada
# Instala tudo do zero usando /root/singulai como raiz
# Uso: bash -c "$(curl -fsSL https://raw.githubusercontent.com/GrupoWinS/frontMVP1/main/deploy-full-vps.sh)"

set -e

DOMAIN="singulai.site"
ROOT_DIR="/root/singulai"
PROJECTS_DIR="$ROOT_DIR/projects"
FRONTEND_DIR="$PROJECTS_DIR/frontend"
SHARED_DIR="$ROOT_DIR/shared"
LOGS_DIR="$ROOT_DIR/logs"
REPO_URL="https://github.com/GrupoWinS/frontMVP1.git"

echo "🚀 Deploy Completo - SingulAI na VPS"
echo "===================================="
echo "Estrutura centralizada em: $ROOT_DIR"
echo ""

# 1. Update sistema
echo "📦 Atualizando sistema..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl git nginx certbot python3-certbot-nginx nodejs npm

# 2. Criar estrutura de diretórios
echo "📁 Criando estrutura de diretórios..."
mkdir -p "$FRONTEND_DIR"
mkdir -p "$PROJECTS_DIR/backend"
mkdir -p "$SHARED_DIR/scripts"
mkdir -p "$LOGS_DIR/nginx"
mkdir -p "$LOGS_DIR/frontend"

# 3. Clone frontend
echo "📥 Clonando repositório frontend..."
if [ -d "$FRONTEND_DIR/.git" ]; then
    cd "$FRONTEND_DIR"
    git fetch origin
    git checkout main
    git pull origin main
else
    git clone "$REPO_URL" "$FRONTEND_DIR"
fi

# 4. Instalar dependências frontend
echo "📦 Instalando dependências..."
cd "$FRONTEND_DIR"
npm install --production

# 5. Build frontend
echo "🔨 Compilando frontend..."
npm run build

# 6. Criar nginx.conf
echo "⚙️ Configurando nginx..."
cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /root/singulai/logs/nginx/error.log warn;

events {
    worker_connections 768;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /root/singulai/logs/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    gzip_min_length 1000;

    server {
        listen 80;
        listen [::]:80;
        server_name singulai.site www.singulai.site;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name singulai.site www.singulai.site;

        ssl_certificate /etc/letsencrypt/live/singulai.site/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/singulai.site/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;

        root /root/singulai/projects/frontend/dist;
        index index.html;

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        location / {
            try_files $uri $uri/ /index.html;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }

        location /api/ {
            proxy_pass http://localhost:3004/api/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# 7. Testar nginx
echo "✅ Testando configuração nginx..."
nginx -t

# 8. Certificado SSL
echo "🔐 Configurando SSL..."
if [ ! -d "/etc/letsencrypt/live/singulai.site" ]; then
    certbot certonly --nginx -d singulai.site -d www.singulai.site --non-interactive --agree-tos -m admin@singulai.site
fi

# 9. Recarregar nginx
echo "🔄 Recarregando nginx..."
systemctl restart nginx

# 10. Criar .env.production
echo "⚙️ Criando .env.production..."
cat > "$FRONTEND_DIR/.env.production" << 'EOF'
VITE_API_URL=https://singulai.site/api/v1
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_CHAIN_ID=11155111
VITE_SGL_TOKEN=0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1
VITE_AVATAR_CONTRACT=0x95F531cafca627A447C0F1119B8b6aCC730163E5
VITE_WALLET_ADDRESS=0x3d3C2E249f9F94e7cfAFC5430f07223ec10AD3bb
EOF

# 11. Criar README na raiz
cat > "$ROOT_DIR/README.md" << 'EOF'
# 🎯 SingulAI Platform - VPS Central

## 📁 Estrutura

```
/root/singulai/
├── projects/
│   ├── frontend/
│   │   ├── dist/        (build final)
│   │   ├── src/
│   │   └── package.json
│   └── backend/
├── shared/
│   ├── deploy-frontend.sh
│   ├── deploy-backend.sh
│   └── .env.production
├── logs/
│   ├── nginx/
│   ├── frontend/
│   └── backend/
└── README.md
```

## 🚀 Deploy Rápido

### Frontend
```bash
cd /root/singulai/projects/frontend
git pull origin main
npm install
npm run build
systemctl reload nginx
```

### Backend
```bash
cd /root/singulai/projects/backend
git pull origin main
npm install
npm run build
systemctl restart singulai-backend
```

## 📊 Status

```bash
systemctl status nginx
netstat -tlnp | grep LISTEN
curl -I https://singulai.site
```

## 🔍 Logs

```bash
# Nginx access
tail -f /root/singulai/logs/nginx/access.log

# Nginx error
tail -f /root/singulai/logs/nginx/error.log
```

## 🔐 SSL

```bash
certbot certificates
certbot renew --dry-run
```
EOF

# 12. Sucesso!
echo ""
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "=================================="
echo ""
echo "🌐 Aplicação em:  https://singulai.site"
echo "📁 Raiz do VPS:   /root/singulai"
echo "📝 Frontend:      /root/singulai/projects/frontend"
echo "📊 Logs:          /root/singulai/logs"
echo ""
echo "Próximos passos:"
echo "1. Verifique: curl -I https://singulai.site"
echo "2. Logs:      tail -f /root/singulai/logs/nginx/access.log"
echo "3. Status:    systemctl status nginx"
echo ""
echo "Deploy automatizado:"
echo "  cd /root/singulai/projects/frontend"
echo "  git pull && npm install && npm run build && systemctl reload nginx"
echo ""
