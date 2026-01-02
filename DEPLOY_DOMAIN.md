# 🚀 DEPLOY NA VPS COM DOMÍNIO - GUIA COMPLETO

## 📋 Pré-requisitos

- ✅ VPS Hostinger em 72.60.147.56
- ✅ Domínio configurado (rodrigo.dev)
- ✅ Acesso SSH como raiz
- ✅ DNS apontando para o IP da VPS

---

## 🔄 PASSO 1: Configurar DNS

Aponte seu domínio para o IP da VPS na sua plataforma de DNS:

```
A Record: rodrigo.dev → 72.60.147.56
A Record: www.rodrigo.dev → 72.60.147.56
```

⏱️ Aguarde 5-15 minutos para o DNS propagar.

---

## 🚀 PASSO 2: Executar Deploy

### Opção A: Deploy Automático (Recomendado)

Conecte ao VPS e execute:

```bash
ssh raiz@72.60.147.56

# Fazer o deploy do repositório
bash -c "$(curl -fsSL https://raw.githubusercontent.com/GrupoWinS/frontMVP1/main/deploy-vps-domain.sh)" -- rodrigo.dev
```

### Opção B: Deploy Manual

```bash
# 1. Conectar ao VPS
ssh raiz@72.60.147.56

# 2. Clonar repositório
git clone https://github.com/GrupoWinS/frontMVP1.git /root/singulai-platform/frontend
cd /root/singulai-platform/frontend

# 3. Instalar dependências
npm install

# 4. Build do projeto
npm run build

# 5. Copiar configuração nginx
cp nginx.conf /etc/nginx/sites-available/rodrigo.dev
ln -sf /etc/nginx/sites-available/rodrigo.dev /etc/nginx/sites-enabled/rodrigo.dev

# 6. Testar nginx
nginx -t

# 7. Configurar SSL
certbot certonly --nginx -d rodrigo.dev -d www.rodrigo.dev

# 8. Recarregar nginx
systemctl reload nginx
```

---

## ✅ PASSO 3: Verificar Deploy

### Verificar se está online

```bash
# Testar acesso HTTP
curl -I http://rodrigo.dev

# Testar acesso HTTPS
curl -I https://rodrigo.dev
```

### Checklist de Validação

- ✅ Acesso via https://rodrigo.dev
- ✅ Redirecionamento HTTP → HTTPS funcionando
- ✅ Certificado SSL válido
- ✅ Página carrega sem erros
- ✅ API conecta corretamente

---

## 📝 CONFIGURAÇÕES ATUALIZADAS

### .env (Production)
```env
VITE_API_URL=https://rodrigo.dev/api/v1
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_CHAIN_ID=11155111
```

### nginx.conf
- Redirecionamento HTTP → HTTPS
- SSL com Let's Encrypt
- Gzip compression habilitado
- Cache para assets estáticos (1 ano)
- SPA routing (todas as rotas → index.html)
- API proxy em `/api/` → localhost:3004

---

## 🔄 ATUALIZAR DEPLOY

Após fazer commits no GitHub, para atualizar a aplicação:

```bash
ssh raiz@72.60.147.56
cd /root/singulai-platform/frontend
git pull
npm install
npm run build
systemctl reload nginx
```

Ou crie um script de update:

```bash
#!/bin/bash
cd /root/singulai-platform/frontend
git pull origin main
npm install --production
npm run build
systemctl reload nginx
echo "✅ Deploy atualizado!"
```

---

## 🔐 SEGURANÇA

### SSL/HTTPS
- ✅ Certificado Let's Encrypt (gratuito)
- ✅ Auto-renovação a cada 60 dias
- ✅ Redirecionamento automático HTTP → HTTPS
- ✅ Headers de segurança configurados

### Headers Adicionados
```
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
```

### Firewall
```bash
# Abrir portas necessárias
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
```

---

## 📊 MONITORAMENTO

### Verificar status do nginx
```bash
systemctl status nginx
```

### Ver logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Verificar uso de disco
```bash
du -sh /root/singulai-platform/frontend
```

### Verificar certificado SSL
```bash
certbot certificates
```

---

## 🔧 TROUBLESHOOTING

### Erro: "Domain not pointing to this server"
- Aguarde DNS propagar (5-15 minutos)
- Verifique A records no seu DNS provider

### Erro: "Failed to connect to API"
- Verifique se backend está rodando em localhost:3004
- Verifique firewall: `ufw status`
- Verifique VITE_API_URL no .env.production

### Erro: "SSL certificate error"
- Verificar: `certbot certificates`
- Renovar: `certbot renew --force-renewal`
- Recarregar nginx: `systemctl reload nginx`

### 404 em rotas da SPA
- Verificar nginx.conf: `try_files $uri $uri/ /index.html;`
- Testar: `nginx -t`
- Recarregar: `systemctl reload nginx`

---

## 📞 CONTATO / SUPORTE

Para problemas com deploy:
1. Verifique logs: `/var/log/nginx/error.log`
2. Teste conectividade: `curl -v https://rodrigo.dev`
3. Verifique certificado: `certbot certificates`

---

## 🎯 CHECKLIST FINAL

- [ ] DNS configurado apontando para 72.60.147.56
- [ ] Deploy script executado sem erros
- [ ] Acesso em https://rodrigo.dev funcionando
- [ ] HTTPS/SSL certificate válido
- [ ] API conecta corretamente
- [ ] Frontend carrega sem erros no console
- [ ] Responsivo em mobile
- [ ] Performance aceitável (Lighthouse > 80)

---

**Status**: ✅ Pronto para Deploy  
**Última atualização**: 02 Jan 2026  
**Versão**: 1.0.0
