# 🚀 INSTRUÇÃO RÁPIDA DE DEPLOY - FRONTEND SINGULAI

## 📍 INFORMAÇÕES DO VPS
- **IP:** 72.60.147.56
- **Usuário SSH:** raiz
- **Hostname:** rodrigo.dev
- **Localização:** /root/singulai-platform/frontend

---

## ⚡ DEPLOY RÁPIDO (2 minutos)

### Copie e execute ESTE COMANDO no terminal do VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/GrupoWinS/frontMVP1/main/deploy-vps.sh | bash
```

**OU manualmente:**

```bash
# 1. Conectar ao VPS
ssh raiz@72.60.147.56

# 2. Clonar repositório
git clone https://github.com/GrupoWinS/frontMVP1.git /root/singulai-platform/frontend
cd /root/singulai-platform/frontend

# 3. Instalar e compilar
npm install
npm run build

# 4. Criar arquivo .env.production
cat > .env.production << 'EOF'
VITE_API_URL=http://localhost:3004/api/v1
VITE_API_TIMEOUT=30000
VITE_API_RETRIES=3
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_SGL_TOKEN_ADDRESS=0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1
VITE_AVATAR_BASE_ADDRESS=0x95F531cafca627A447C0F1119B8b6aCC730163E5
VITE_AVATAR_WALLET_LINK_ADDRESS=0x9F475e5D174577f2FB17a9D94a8093e2D8c9ED41
VITE_TIMECAPSULE_ADDRESS=0x6A58aD664071d450cF7e794Dac5A13e3a1DeD172
VITE_LEGACY_ADDRESS=0x0Ee8f5dC7E9BC9AF344eB987B8363b33E737b757
VITE_APP_NAME=SingulAI
EOF

# 5. Criar serviço systemd
sudo tee /etc/systemd/system/singulai-frontend.service > /dev/null << 'EOF'
[Unit]
Description=SingulAI Frontend - Vite React
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/singulai-platform/frontend
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port 8080
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 6. Ativar serviço
sudo systemctl daemon-reload
sudo systemctl enable singulai-frontend
sudo systemctl start singulai-frontend

# 7. Verificar
sudo systemctl status singulai-frontend
```

---

## ✅ VERIFICAÇÃO

Após o deploy, verifique se está funcionando:

```bash
# Status
systemctl status singulai-frontend

# Logs em tempo real
journalctl -u singulai-frontend -f

# Teste local
curl http://localhost:8080

# Teste remoto
curl http://72.60.147.56:8080
```

---

## 📡 URLS FINAIS

| Serviço | URL |
|---------|-----|
| **Frontend** | http://72.60.147.56:8080 |
| **API Backend** | http://72.60.147.56:3004/api/v1 |
| **Swagger Docs** | http://72.60.147.56:3004/api/docs |

---

## 🔧 COMANDOS DE MANUTENÇÃO

```bash
# Reiniciar frontend
systemctl restart singulai-frontend

# Parar frontend
systemctl stop singulai-frontend

# Iniciar frontend
systemctl start singulai-frontend

# Ver logs (últimas 50 linhas)
journalctl -u singulai-frontend -n 50

# Atualizar código (pull latest)
cd /root/singulai-platform/frontend
git pull origin main
npm install
npm run build
systemctl restart singulai-frontend
```

---

## ❓ TROUBLESHOOTING

### Frontend não inicia
```bash
# Verificar erros
journalctl -u singulai-frontend -n 20 | grep -i error

# Verificar porta
lsof -i :8080
```

### Frontend não conecta ao Backend
```bash
# Testar conectividade
curl http://localhost:3004/api/v1/blockchain/health

# Checar .env.production
cat .env.production | grep VITE_API
```

### Rebuild completo
```bash
cd /root/singulai-platform/frontend
rm -rf node_modules dist package-lock.json
npm install
npm run build
systemctl restart singulai-frontend
```

---

## 📊 ESTRUTURA FINAL

```
/root/singulai-platform/
├── backend/
│   └── api/          ← Backend NestJS (porta 3004)
├── frontend/         ← Frontend Vite React (porta 8080)
└── docs/
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Acessar http://72.60.147.56:8080
2. ✅ Conectar carteira MetaMask (Sepolia)
3. ✅ Testar endpoints da API
4. ⏭️ Configurar Nginx (reverse proxy + SSL)
5. ⏭️ Adicionar domínio rodrigo.dev
6. ⏭️ Configurar HTTPS com Let's Encrypt

---

**Versão:** 1.0  
**Data:** 01/01/2026  
**Status:** ✅ Pronto para Deploy
