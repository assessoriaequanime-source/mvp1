#!/bin/bash

# Script para criar ponto de restauração - Etapa 3
# Execute na VPS para documentar o estado atual

CHECKPOINT_DIR="/root/singulai/docs"
TIMESTAMP=$(date "+%Y-%m-%d_%H-%M-%S")
CHECKPOINT_FILE="$CHECKPOINT_DIR/ETAPA-3-CHECKPOINT_$TIMESTAMP.md"

mkdir -p "$CHECKPOINT_DIR"

echo "📝 Criando ponto de restauração - Etapa 3..."

cat > "$CHECKPOINT_FILE" << 'EOF'
# 📋 PONTO DE RESTAURAÇÃO - ETAPA 3 COMPLETA

**Data:** $(date)
**Status:** ✅ CONCLUÍDO
**Versão API:** 2.0.0

---

## ✅ RESUMO DA ETAPA 3 - Backend API NestJS

| Componente | Status | Detalhes |
|------------|--------|----------|
| Framework | ✅ | NestJS + TypeScript |
| Porta | ✅ | 3004 |
| Systemd | ✅ | Serviço persistente |
| Swagger | ✅ | /api/docs |
| CORS | ✅ | Habilitado |
| Blockchain | ✅ | Sepolia conectada |

---

## 📡 ENDPOINTS (19 rotas)

### Blockchain
- GET /api/v1/blockchain/health
- GET /api/v1/blockchain/status
- GET /api/v1/blockchain/sgl/info
- GET /api/v1/blockchain/sgl/balance/:address
- POST /api/v1/blockchain/sgl/transfer
- POST /api/v1/blockchain/sgl/mint
- POST /api/v1/blockchain/sgl/airdrop
- GET /api/v1/blockchain/avatar/balance/:address
- POST /api/v1/blockchain/avatar/mint

### Staking
- GET /api/v1/staking/info
- GET /api/v1/staking/user/:address
- GET /api/v1/staking/leaderboard

### TimeCapsule
- GET /api/v1/timecapsule/info
- GET /api/v1/timecapsule/user/:address
- GET /api/v1/timecapsule/capsule/:id

### Legacy
- GET /api/v1/legacy/info
- GET /api/v1/legacy/user/:address
- GET /api/v1/legacy/legacy/:id

---

## 🔧 SERVIÇO SYSTEMD

**Status:**
EOF

# Adicionar status atual do serviço
systemctl status singulai-api >> "$CHECKPOINT_FILE" 2>&1 || echo "Serviço não encontrado" >> "$CHECKPOINT_FILE"

cat >> "$CHECKPOINT_FILE" << 'EOF'

**Comando de Restart:**
```bash
sudo systemctl restart singulai-api
```

---

## 📁 ESTRUTURA

/root/singulai/projects/backend/
├── dist/
├── src/
│   ├── blockchain/
│   ├── staking/
│   ├── timecapsule/
│   └── legacy/
├── .env
└── package.json

---

## 📊 CONTRATOS

EOF

# Adicionar endereços de contratos
echo "Adicionando informações de contratos..." >> "$CHECKPOINT_FILE"

cat >> "$CHECKPOINT_FILE" << 'EOF'

| Contrato | Endereço |
|----------|----------|
| SGL Token | 0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1 |
| Avatar | 0x95F531cafca627A447C0F1119B8b6aCC730163E5 |
| TimeCapsule | 0x6A58aD664071d450cF7e794Dac5A13e3a1DeD172 |
| Legacy | 0x0Ee8f5dC7E9BC9AF344eB987B8363b33E737b757 |

---

## ✅ VALIDAÇÃO

Teste a API:
```bash
curl -s http://localhost:3004/api/v1/blockchain/health | jq .
```

Ver logs:
```bash
journalctl -u singulai-api -f
```

---

**Checkpoint criado:** $(date)
**Próxima etapa:** Etapa 4 - Frontend Dashboard
EOF

echo "✅ Checkpoint criado em: $CHECKPOINT_FILE"
echo ""
echo "Conteúdo:"
cat "$CHECKPOINT_FILE"
