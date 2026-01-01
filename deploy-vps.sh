#!/bin/bash

#####################################################################
# DEPLOY FRONTEND SINGULAI - VPS HOSTINGER
# Execute este script diretamente no VPS (raiz@72.60.147.56)
# 
# Comando: bash ~/deploy-frontend.sh
#####################################################################

echo "🚀 DEPLOY FRONTEND SINGULAI - VPS HOSTINGER"
echo "==========================================="
echo "Data: $(date)"
echo "IP: $(hostname -I | awk '{print $1}')"
echo ""

set -e

# Variáveis
DEPLOY_DIR="/root/singulai-platform/frontend"
REPO_URL="https://github.com/GrupoWinS/frontMVP1.git"
BRANCH="main"

# 1. Criar diretório
echo "📁 [1/8] Criando diretório de deploy..."
mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

# 2. Clonar/atualizar repo
if [ -d ".git" ]; then
  echo "📥 [2/8] Atualizando repositório..."
  git fetch origin
  git checkout $BRANCH
  git pull origin $BRANCH
else
  echo "📦 [2/8] Clonando repositório..."
  git clone --branch $BRANCH "$REPO_URL" .
fi

# 3. Instalar dependências
echo "📦 [3/8] Instalando dependências (pode levar 1-2 min)..."
npm install --prefer-offline 2>&1 | tail -3

# 4. Criar .env.production
echo "⚙️  [4/8] Configurando .env.production..."
cat > .env.production << 'ENVEOF'
# API Backend - Production
VITE_API_URL=http://localhost:3004/api/v1
VITE_API_TIMEOUT=30000
VITE_API_RETRIES=3

# Blockchain
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Smart Contracts (Sepolia)
VITE_SGL_TOKEN_ADDRESS=0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1
VITE_AVATAR_BASE_ADDRESS=0x95F531cafca627A447C0F1119B8b6aCC730163E5
VITE_AVATAR_WALLET_LINK_ADDRESS=0x9F475e5D174577f2FB17a9D94a8093e2D8c9ED41
VITE_TIMECAPSULE_ADDRESS=0x6A58aD664071d450cF7e794Dac5A13e3a1DeD172
VITE_LEGACY_ADDRESS=0x0Ee8f5dC7E9BC9AF344eB987B8363b33E737b757

# App
VITE_APP_NAME=SingulAI
ENVEOF
echo "✅ .env.production criado"

# 5. Build
echo "🔨 [5/8] Compilando projeto (pode levar 1-2 min)..."
npm run build 2>&1 | grep -E "(dist/|built in)" | tail -5

# 6. Criar serviço systemd
echo "⚙️  [6/8] Configurando serviço systemd..."
cat > /etc/systemd/system/singulai-frontend.service << 'SVCEOF'
[Unit]
Description=SingulAI Frontend - Vite React
Documentation=https://github.com/GrupoWinS/frontMVP1
After=network.target singulai-api.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/singulai-platform/frontend
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port 8080
Restart=always
RestartSec=10
Environment=NODE_ENV=production
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SVCEOF
echo "✅ Serviço systemd criado"

# 7. Ativar e iniciar serviço
echo "🔄 [7/8] Ativando serviço..."
systemctl daemon-reload
systemctl enable singulai-frontend
systemctl restart singulai-frontend

# 8. Aguardar e verificar
echo "⏳ [8/8] Aguardando inicialização (3 segundos)..."
sleep 3

echo ""
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "==========================================="
echo ""

# Verificar status
echo "📊 Status do Frontend:"
if systemctl is-active --quiet singulai-frontend; then
  echo "   ✅ Frontend: RODANDO"
else
  echo "   ❌ Frontend: PARADO"
fi

echo ""
echo "📊 Status do Backend:"
if systemctl is-active --quiet singulai-api; then
  echo "   ✅ Backend: RODANDO"
else
  echo "   ⚠️ Backend: PARADO (verificar com: systemctl status singulai-api)"
fi

echo ""
echo "📡 URLS EM PRODUÇÃO:"
echo "   🌐 Frontend:    http://72.60.147.56:8080"
echo "   🔗 API Backend: http://72.60.147.56:3004/api/v1"
echo "   📚 API Docs:    http://72.60.147.56:3004/api/docs"
echo ""

echo "🔍 COMANDOS ÚTEIS:"
echo "   Ver logs:       journalctl -u singulai-frontend -f"
echo "   Reiniciar:      systemctl restart singulai-frontend"
echo "   Status:         systemctl status singulai-frontend"
echo "   Parar:          systemctl stop singulai-frontend"
echo ""

echo "📁 Diretório: $DEPLOY_DIR"
echo "🎯 Próxima etapa: Acessar http://72.60.147.56:8080 no navegador"
echo ""
