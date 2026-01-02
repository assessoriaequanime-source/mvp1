#!/bin/bash

# Script de Setup da VPS - Estrutura Centralizada
# Cria estrutura de diretórios limpa e organizada
# Uso: ./setup-vps-structure.sh

set -e

ROOT_DIR="/root/singulai"
PROJECTS_DIR="$ROOT_DIR/projects"
FRONTEND_DIR="$PROJECTS_DIR/frontend"
BACKEND_DIR="$PROJECTS_DIR/backend"
SHARED_DIR="$ROOT_DIR/shared"
LOGS_DIR="$ROOT_DIR/logs"

echo "🏗️ Configurando estrutura centralizada da VPS"
echo "=============================================="
echo ""
echo "Estrutura que será criada:"
echo "  /root/singulai/"
echo "  ├── projects/"
echo "  │   ├── frontend/      (React + Vite)"
echo "  │   └── backend/       (NestJS)"
echo "  ├── shared/            (configs, scripts)"
echo "  └── logs/              (nginx, app)"
echo ""

# 1. Criar estrutura de diretórios
echo "📁 Criando estrutura de diretórios..."
mkdir -p "$FRONTEND_DIR"
mkdir -p "$BACKEND_DIR"
mkdir -p "$SHARED_DIR"
mkdir -p "$LOGS_DIR/nginx"
mkdir -p "$LOGS_DIR/frontend"
mkdir -p "$LOGS_DIR/backend"

# 2. Criar arquivo README na raiz
cat > "$ROOT_DIR/README.md" << 'EOF'
# SingulAI Platform - VPS Structure

## Estrutura de Diretórios

```
/root/singulai/
├── projects/
│   ├── frontend/          # React + Vite
│   │   ├── dist/          (build output)
│   │   ├── src/
│   │   └── package.json
│   └── backend/           # NestJS
│       ├── src/
│       └── package.json
├── shared/
│   ├── nginx.conf         (nginx configuration)
│   ├── env.production     (shared env vars)
│   └── scripts/           (utility scripts)
├── logs/
│   ├── nginx/
│   ├── frontend/
│   └── backend/
└── README.md              (este arquivo)
```

## Como Deployar

### Frontend (React)
```bash
cd /root/singulai/projects/frontend
git pull origin main
npm install
npm run build
systemctl reload nginx
```

### Backend (NestJS)
```bash
cd /root/singulai/projects/backend
git pull origin main
npm install
npm run build
systemctl restart singulai-backend
```

## Serviços

### Nginx (Frontend)
```bash
systemctl status nginx
systemctl reload nginx
```

### Backend
```bash
systemctl status singulai-backend
systemctl restart singulai-backend
```

## Logs

### Nginx
```bash
tail -f /root/singulai/logs/nginx/access.log
tail -f /root/singulai/logs/nginx/error.log
```

### Frontend Build
```bash
tail -f /root/singulai/logs/frontend/build.log
```

### Backend
```bash
tail -f /root/singulai/logs/backend/app.log
```

## Certificados SSL

```bash
certbot certificates
certbot renew --dry-run
```

## Troubleshooting

### Verificar portas
```bash
netstat -tlnp | grep LISTEN
```

### Verificar espaço em disco
```bash
df -h /root/singulai
```

### Limpar cache npm
```bash
cd /root/singulai/projects/frontend
npm cache clean --force
```
EOF

# 3. Criar nginx.conf centralizado
cat > "$SHARED_DIR/nginx.conf" << 'EOF'
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
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    gzip on;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;
    gzip_min_length 1000;

    # Frontend - singulai.site
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
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "SAMEORIGIN" always;

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

# 4. Criar script de deploy rápido
cat > "$SHARED_DIR/deploy-frontend.sh" << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploy Frontend"
cd /root/singulai/projects/frontend

echo "📥 Atualizando repositório..."
git fetch origin
git checkout main
git pull origin main

echo "📦 Instalando dependências..."
npm install --production

echo "🔨 Compilando projeto..."
npm run build

echo "🔄 Recarregando nginx..."
systemctl reload nginx

echo "✅ Deploy concluído!"
echo "📍 Acesse: https://singulai.site"
EOF

chmod +x "$SHARED_DIR/deploy-frontend.sh"

# 5. Criar script de deploy backend
cat > "$SHARED_DIR/deploy-backend.sh" << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploy Backend"
cd /root/singulai/projects/backend

echo "📥 Atualizando repositório..."
git fetch origin
git checkout main
git pull origin main

echo "📦 Instalando dependências..."
npm install

echo "🔨 Compilando projeto..."
npm run build

echo "🔄 Reiniciando serviço..."
systemctl restart singulai-backend

echo "✅ Deploy concluído!"
echo "📍 API: https://singulai.site/api/v1"
EOF

chmod +x "$SHARED_DIR/deploy-backend.sh"

# 6. Criar .env.production centralizado
cat > "$SHARED_DIR/.env.production" << 'EOF'
# Frontend - Production
VITE_API_URL=https://singulai.site/api/v1
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_CHAIN_ID=11155111
VITE_SGL_TOKEN=0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1
VITE_AVATAR_CONTRACT=0x95F531cafca627A447C0F1119B8b6aCC730163E5
VITE_WALLET_ADDRESS=0x3d3C2E249f9F94e7cfAFC5430f07223ec10AD3bb

# Backend - Production
DATABASE_URL=postgresql://user:password@localhost:5432/singulai
JWT_SECRET=your-secret-key
API_PORT=3004
EOF

# 7. Status
echo ""
echo "✅ Estrutura criada com sucesso!"
echo "=================================="
echo ""
echo "📁 Raiz do projeto: /root/singulai"
echo ""
echo "Próximos passos:"
echo "1. Clone os repositórios:"
echo "   cd $FRONTEND_DIR"
echo "   git clone https://github.com/GrupoWinS/frontMVP1.git ."
echo ""
echo "2. Configure nginx:"
echo "   sudo cp $SHARED_DIR/nginx.conf /etc/nginx/nginx.conf"
echo "   sudo systemctl reload nginx"
echo ""
echo "3. Use os scripts de deploy:"
echo "   $SHARED_DIR/deploy-frontend.sh"
echo "   $SHARED_DIR/deploy-backend.sh"
echo ""
echo "Logs disponíveis em: /root/singulai/logs/"
echo ""
