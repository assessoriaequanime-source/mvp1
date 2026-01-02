#!/bin/bash

# Script de Deploy do Frontend SingulAI no VPS Hostinger
# Endereço: 72.60.147.56 (raiz@rodrigo.dev)
# Localização: /root/singulai-platform/frontend

set -e

echo "🚀 Iniciando Deploy do Frontend SingulAI"
echo "=========================================="

# 1. Definir variáveis
DEPLOY_DIR="/root/singulai-platform/frontend"
REPO_URL="https://github.com/GrupoWinS/frontMVP1.git"
BRANCH="main"
NODE_PORT=8080
API_PORT=3004

# 2. Criar diretório de deploy se não existir
echo "📁 Preparando diretório de deploy..."
mkdir -p "$DEPLOY_DIR"

# 3. Clonar ou atualizar repositório
if [ -d "$DEPLOY_DIR/.git" ]; then
  echo "📥 Atualizando repositório..."
  cd "$DEPLOY_DIR"
  git fetch origin
  git checkout $BRANCH
  git pull origin $BRANCH
else
  echo "📦 Clonando repositório..."
  git clone --branch $BRANCH "$REPO_URL" "$DEPLOY_DIR"
  cd "$DEPLOY_DIR"
fi

# 4. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 5. Criar arquivo .env.production se não existir
if [ ! -f "$DEPLOY_DIR/.env.production" ]; then
  echo "⚙️ Criando .env.production..."
  cat > .env.production << EOF
# API Backend - Production (VPS Hostinger)
VITE_API_URL=https://singulai.site/api/v1
VITE_API_TIMEOUT=30000
VITE_API_RETRIES=3

# Blockchain
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Smart Contracts (Sepolia Testnet)
VITE_SGL_TOKEN_ADDRESS=0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1
VITE_AVATAR_BASE_ADDRESS=0x95F531cafca627A447C0F1119B8b6aCC730163E5
VITE_AVATAR_WALLET_LINK_ADDRESS=0x9F475e5D174577f2FB17a9D94a8093e2D8c9ED41
VITE_TIMECAPSULE_ADDRESS=0x6A58aD664071d450cF7e794Dac5A13e3a1DeD172
VITE_LEGACY_ADDRESS=0x0Ee8f5dC7E9BC9AF344eB987B8363b33E737b757

# App
VITE_APP_NAME=SingulAI
EOF
  echo "✅ .env.production criado"
fi

# 6. Build
echo "🔨 Compilando projeto..."
npm run build

# 7. Criar serviço systemd
echo "⚙️ Configurando serviço systemd..."
sudo tee /etc/systemd/system/singulai-frontend.service > /dev/null << EOF
[Unit]
Description=SingulAI Frontend - Vite
Documentation=https://github.com/singulai/platform
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port 8080
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 8. Recarregar systemd e iniciar serviço
echo "🔄 Ativando serviço..."
sudo systemctl daemon-reload
sudo systemctl enable singulai-frontend
sudo systemctl restart singulai-frontend

# 9. Aguardar que o serviço inicie
sleep 3

# 10. Verificar status
echo ""
echo "✅ Deploy Concluído!"
echo "=========================================="
echo "📊 Status do Serviço:"
sudo systemctl status singulai-frontend --no-pager

echo ""
echo "📝 URLs:"
echo "  Frontend: http://localhost:8080"
echo "  Frontend (Externo): http://72.60.147.56:8080"
echo "  Backend API: http://localhost:3004/api/v1"
echo ""
echo "🔍 Ver logs:"
echo "  journalctl -u singulai-frontend -f"
echo ""
echo "✨ Frontend está rodando em produção!"
