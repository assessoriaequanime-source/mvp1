#!/bin/bash

# Script de Deploy Completo - Frontend SingulAI com Domínio
# Uso: ./deploy-vps-domain.sh [dominio.com]
# Exemplo: ./deploy-vps-domain.sh singulai.site

set -e

DOMAIN="${1:-singulai.site}"
DEPLOY_DIR="/root/singulai-platform/frontend"
REPO_URL="https://github.com/GrupoWinS/frontMVP1.git"
BRANCH="main"

echo "🚀 Deploy Frontend SingulAI com Domínio"
echo "========================================"
echo "Domínio: $DOMAIN"
echo "Diretório: $DEPLOY_DIR"
echo ""

# 1. Atualizar sistema
echo "📦 Atualizando sistema..."
apt-get update -qq
apt-get install -y -qq curl git nginx certbot python3-certbot-nginx

# 2. Criar diretório de deploy
echo "📁 Preparando diretório..."
mkdir -p "$DEPLOY_DIR"

# 3. Clonar ou atualizar repositório
echo "📥 Clonando/atualizando repositório..."
if [ -d "$DEPLOY_DIR/.git" ]; then
    cd "$DEPLOY_DIR"
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
else
    git clone --branch $BRANCH "$REPO_URL" "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
fi

# 4. Instalar Node.js se não existir
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    apt-get install -y -qq nodejs
fi

# 5. Instalar dependências npm
echo "📦 Instalando dependências npm..."
npm install --production

# 6. Build do projeto
echo "🔨 Compilando projeto..."
npm run build

# 7. Configurar nginx
echo "⚙️ Configurando nginx..."
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    root $DEPLOY_DIR/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    gzip_min_length 1000;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location /api/ {
        proxy_pass http://localhost:3004/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 8. Ativar site no nginx
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
rm -f /etc/nginx/sites-enabled/default

# 9. Testar configuração nginx
echo "✅ Testando configuração nginx..."
nginx -t

# 10. Solicitar certificado SSL
echo "🔐 Configurando SSL com Let's Encrypt..."
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN
fi

# 11. Recarregar nginx
echo "🔄 Recarregando nginx..."
systemctl reload nginx

# 12. Criar arquivo .env.production
echo "⚙️ Configurando .env.production..."
cat > "$DEPLOY_DIR/.env.production" << EOF
# Production Configuration
VITE_API_URL=https://$DOMAIN/api/v1
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_CHAIN_ID=11155111
VITE_SGL_TOKEN=0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1
VITE_AVATAR_CONTRACT=0x95F531cafca627A447C0F1119B8b6aCC730163E5
VITE_WALLET_ADDRESS=0x3d3C2E249f9F94e7cfAFC5430f07223ec10AD3bb
EOF

# 13. Configurar auto-renovação de SSL
echo "🔄 Configurando auto-renovação SSL..."
certbot renew --dry-run

# 14. Criar systemd service para renovação
cat > /etc/systemd/system/certbot-renew.service << EOF
[Unit]
Description=Certbot renewal service
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/bin/certbot renew --quiet
EOF

cat > /etc/systemd/system/certbot-renew.timer << EOF
[Unit]
Description=Run Certbot renewal daily
Requires=certbot-renew.service

[Timer]
OnCalendar=daily
OnBootSec=1h
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable certbot-renew.timer
systemctl start certbot-renew.timer

# 15. Sucesso!
echo ""
echo "✅ Deploy concluído com sucesso!"
echo "=================================="
echo "🌐 Acesse sua aplicação em: https://$DOMAIN"
echo "📝 Arquivo .env.production criado"
echo "🔐 SSL configurado e auto-renovação ativada"
echo ""
echo "Próximos passos:"
echo "1. Atualize seu DNS para apontar para 72.60.147.56"
echo "2. Aguarde alguns minutos para o DNS propagar"
echo "3. Acesse https://$DOMAIN"
echo ""
echo "Para atualizar manualmente:"
echo "  cd $DEPLOY_DIR && git pull && npm install && npm run build && systemctl reload nginx"
