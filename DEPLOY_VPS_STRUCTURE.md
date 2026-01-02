# 🎯 DEPLOY NA VPS - ESTRUTURA CENTRALIZADA

## 📍 Nova Estrutura

Toda a aplicação centralizada em **`/root/singulai`**:

```
/root/singulai/
├── projects/
│   ├── frontend/        ← React + Vite (aqui!)
│   └── backend/         ← NestJS (quando pronto)
├── shared/              ← Scripts e configs compartilhadas
├── logs/                ← Nginx, frontend, backend logs
└── README.md
```

---

## 🚀 DEPLOY AUTOMÁTICO (Recomendado)

Conecte na VPS e execute:

```bash
ssh raiz@72.60.147.56

# Deploy completo - cria estrutura + configura tudo
bash -c "$(curl -fsSL https://raw.githubusercontent.com/GrupoWinS/frontMVP1/main/deploy-full-vps.sh)"
```

**Isso vai:**
- ✅ Criar estrutura em `/root/singulai`
- ✅ Clonar repositório frontend
- ✅ Instalar dependências
- ✅ Compilar projeto
- ✅ Configurar nginx
- ✅ Gerar certificado SSL
- ✅ Ativar HTTPS

---

## 🔄 ATUALIZAR FRONTEND (Após commits)

```bash
# Na VPS
cd /root/singulai/projects/frontend
git pull origin main
npm install
npm run build
systemctl reload nginx
```

Ou use o script:
```bash
/root/singulai/shared/deploy-frontend.sh
```

---

## 📊 VERIFICAR STATUS

```bash
# Nginx rodando?
systemctl status nginx

# Acesso funciona?
curl -I https://singulai.site

# Logs
tail -f /root/singulai/logs/nginx/access.log
tail -f /root/singulai/logs/nginx/error.log
```

---

## 🔐 SSL/HTTPS

Certificado automático com Let's Encrypt:

```bash
# Ver certificados
certbot certificates

# Renovar (automático a cada 60 dias)
certbot renew --dry-run
```

---

## 📝 Arquivos Criados/Atualizados

| Arquivo | Descrição |
|---------|-----------|
| `deploy-full-vps.sh` | **Deploy completo (novo)** |
| `setup-vps-structure.sh` | Setup da estrutura centralizada |
| `.env` | Atualizado para singulai.site |
| `deploy.sh` | Deploy antigo (opcional) |

---

## ⚡ QUICK START

1. **Conecte na VPS:**
```bash
ssh raiz@72.60.147.56
```

2. **Execute deploy:**
```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/GrupoWinS/frontMVP1/main/deploy-full-vps.sh)"
```

3. **Acesse:**
```
https://singulai.site
```

4. **Pronto!** ✅

---

## 📋 Checklist

- [ ] Executou deploy na VPS
- [ ] Acesso em https://singulai.site funciona
- [ ] SSL/HTTPS válido
- [ ] Nginx status OK
- [ ] Logs sem erros
- [ ] Frontend carrega corretamente

---

**Estrutura pronta para crescer!** 🚀
