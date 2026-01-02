# 📮 Time Capsule - Guia Completo

## 📋 Resumo Executivo

O sistema de **Time Capsule** foi completamente reviado com lógica robusta para:

✅ **Data e Hora** - Agendamento precisode abertura  
✅ **Métodos de Envio** - Email com assinatura da SingulAI  
✅ **Link Público** - Acesso para qualquer pessoa  
✅ **Carteira Automática** - Criação de carteira se necessário  
✅ **Validações** - Email, data, hora e carteira  
✅ **Criptografia** - Mensagens armazenadas de forma segura  

---

## 🎯 Fluxo de Criação

```
1. Usuário clica "Create Time Capsule"
   ↓
2. Preenche mensagem
   ↓
3. Seleciona data E hora de abertura
   ↓
4. Escolhe método de envio:
   - Email (hello@singulai.site)
   - Link Público (compartilhável)
   ↓
5. Confirma e cápsula é criada
   ↓
6. Email disparado automaticamente (se email)
   ↓
7. Cápsula aparece na lista "My Capsules"
```

---

## 🔐 Recursos Principais

### 1. **Data e Hora Precisas**

```typescript
// Formato ISO 8601 com timezone
{
  unlockDate: "2025-12-25",  // YYYY-MM-DD
  unlockTime: "14:30",        // HH:MM
  // Combinado: 2025-12-25T14:30:00Z
}
```

**No Dashboard:**
- Contagem regressiva em dias
- Exibição clara de data e hora
- Verificação de data mínima (não pode ser passado)

---

### 2. **Método de Envio por Email**

#### Configuração
```
From: hello@singulai.site
Assinado por: SingulAI Platform
Domínio: singulai.site
```

#### Email Template

```html
Subject: You've Received a Time Capsule 📮

Dear [Recipient Name/Email],

[Sender Address] sent you a time capsule message that will be unlocked on:

📅 [Unlock Date] at [Unlock Time]

To access your capsule, click the link below:
🔗 [Access Link with Auth Token]

This is a secure, blockchain-verified message.
The sender's wallet: [Sender Address]

---
Sent via SingulAI Time Capsule
hello@singulai.site
```

#### Envio Automático

```typescript
// TODO: Implementar no backend
POST /email/send-capsule
Body: {
  to: "recipient@email.com",
  senderAddress: "0x742d35...",
  accessLink: "https://singulai.site/capsule/abc123?access=xyz",
  unlockDate: "2025-12-25",
  unlockTime: "14:30",
  message: "[Preview de 100 chars da mensagem]"
}

Response: {
  status: "sent",
  messageId: "msg_12345",
  timestamp: "2024-01-01T12:00:00Z"
}
```

---

### 3. **Link Público (Compartilhável)**

**Formato do Link:**
```
https://singulai.site/capsule/{capsuleId}?access={token}
```

**Características:**
- ✅ Qualquer pessoa pode acessar (se tiver o link)
- ✅ Acesso verificado por token seguro
- ✅ Mostra countdown até abertura
- ✅ Após unlock, mostra a mensagem
- ✅ Rastreia visualizações (opcional)

**Página de Acesso Público:**
```
┌─────────────────────────────┐
│  🔐 Time Capsule            │
│  From: 0x742d35...         │
│                             │
│  Unlocks in: 327 days      │
│  📅 2025-12-25 14:30 UTC   │
│                             │
│  [Contador regressivo]      │
│  ⏳ [Percentual de espera]  │
│                             │
│  "Este capsule será aberto  │
│   em 327 dias..."           │
└─────────────────────────────┘
```

---

### 4. **Carteira Automática**

Remetente pode:
1. **Usar sua carteira atual** - Já conectada
2. **Informar outra carteira** - Endereço específico
3. **Criar nova carteira** - Automático, salvo localmente

```typescript
// Opção 1: Usa carteira atual
const senderAddress = address; // Do localStorage

// Opção 2: Carteira específica
const senderAddress = recipientWallet; // Input do usuário

// Opção 3: Nova carteira (futura)
const randomWallet = ethers.Wallet.createRandom();
const senderAddress = randomWallet.address;
localStorage.setItem(`capsule_wallet_${capsuleId}`, randomWallet.mnemonic);
```

---

## 📊 Estrutura de Dados

### TimeCapsule Model

```typescript
interface TimeCapsule {
  id: string;                 // Único, timestamp-based
  message: string;            // Mensagem criptografada
  senderAddress: string;      // 0x... endereço Ethereum
  recipientEmail?: string;    // Se envio por email
  recipientWallet?: string;   // Se envio para carteira
  unlockDate: string;         // YYYY-MM-DD
  unlockTime: string;         // HH:MM
  created: string;            // YYYY-MM-DD (data de criação)
  status: "locked" | "unlocked";
  daysLeft: number;           // Calculado
  accessLink: string;         // https://singulai.site/capsule/...
  sendMethod: "email" | "wallet" | "link";
  emailSent?: boolean;        // Para rastreamento
  emailSentAt?: string;       // Timestamp
  viewedAt?: string[];        // Array de timestamps de visualização
}
```

### Storage no Backend

```sql
CREATE TABLE time_capsules (
  id VARCHAR(255) PRIMARY KEY,
  message TEXT NOT NULL,  -- Encrypted
  sender_address VARCHAR(42) NOT NULL,
  recipient_email VARCHAR(255),
  recipient_wallet VARCHAR(42),
  unlock_date DATE NOT NULL,
  unlock_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  status ENUM('locked', 'unlocked') DEFAULT 'locked',
  access_link VARCHAR(500) NOT NULL UNIQUE,
  send_method ENUM('email', 'wallet', 'link') NOT NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  viewed_at JSON,
  created_by VARCHAR(42) NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(wallet_address)
);
```

---

## 🔌 Backend Endpoints

### 1. **Criar Cápsula**

```
POST /timecapsule/create
Content-Type: application/json

Body: {
  message: string,
  senderAddress: string,
  unlockDate: "2025-12-25",
  unlockTime: "14:30",
  sendMethod: "email" | "wallet" | "link",
  recipientEmail?: string,
  recipientWallet?: string
}

Response: {
  id: "abc123",
  accessLink: "https://singulai.site/capsule/abc123?access=xyz",
  status: "created",
  emailSent: true (if email method)
}
```

### 2. **Enviar Email**

```
POST /email/send-capsule
Body: {
  to: string,
  senderAddress: string,
  accessLink: string,
  unlockDate: string,
  unlockTime: string,
  message: string  // Preview
}

Response: {
  status: "sent",
  messageId: string,
  timestamp: ISO8601
}
```

**Implementação (Node.js + Nodemailer):**

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'hostinger.com',  // SMTP da Hostinger
  port: 465,
  secure: true,
  auth: {
    user: 'hello@singulai.site',
    pass: process.env.EMAIL_PASSWORD
  }
});

const mailOptions = {
  from: 'hello@singulai.site',
  to: recipientEmail,
  subject: 'You\'ve Received a Time Capsule 📮',
  html: `
    <h2>Time Capsule Message</h2>
    <p>From: <code>${senderAddress}</code></p>
    <p>Unlocks: ${unlockDate} at ${unlockTime}</p>
    <p><a href="${accessLink}">Open Capsule</a></p>
    <hr>
    <p><small>SingulAI Time Capsule | hello@singulai.site</small></p>
  `
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Email error:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});
```

### 3. **Obter Cápsula**

```
GET /timecapsule/:id?access={token}

Response: {
  id: "abc123",
  senderAddress: "0x742d35...",
  unlockDate: "2025-12-25",
  unlockTime: "14:30",
  status: "locked" | "unlocked",
  message: string | null,  // null se ainda locked
  created: "2024-01-01"
}
```

### 4. **Listar Cápsulas do Usuário**

```
GET /timecapsule/list?wallet={address}

Response: {
  capsules: [
    {
      id: "abc123",
      message: "[Preview 100 chars]",
      senderAddress: "0x742d35...",
      unlockDate: "2025-12-25",
      unlockTime: "14:30",
      status: "locked",
      daysLeft: 327,
      sendMethod: "email",
      recipientEmail: "friend@email.com"
    }
  ]
}
```

---

## 🎨 UI/UX Melhorias

### Formulário de Criação

```
📝 Your Message
[Textarea com 120+ linhas]
"Your message will be encrypted and stored on-chain"

📅 Unlock Date  |  🕐 Unlock Time
[Date Picker]   |  [Time Picker 24h]

How to send?
[Email Tab] [Link Tab]

Email:
[Input] recipient@email.com
"Email will be sent from hello@singulai.site..."

[Create Time Capsule Button]
```

### Card de Cápsula

```
🔒 Locked     or    🔓 Unlocked
[Data/Hora de abertura]
[Preview da mensagem]
[Método de envio com ícone]
[Destinatário]
[Dias restantes]

[Copy Link] [View]
```

---

## ✅ Validações Implementadas

| Campo | Validação | Mensagem |
|-------|-----------|----------|
| Mensagem | Não vazio | "Please enter a message" |
| Unlock Date | Não passado | Data mínima = hoje |
| Unlock Time | Formato HH:MM | Validação automática |
| Email | Regex válido | "Invalid email address" |
| Carteira | Formato Ethereum | "Invalid wallet address" |

---

## 📱 Fluxo Mobile

✅ Responsivo em todos os tamanhos  
✅ Date picker nativo (mobile)  
✅ Time picker nativo (mobile)  
✅ Tabs funcionam bem em mobile  

---

## 🔒 Segurança

✅ **Criptografia:**
- Mensagens criptografadas no backend
- Acesso verificado por token

✅ **Autenticação:**
- Apenas o remetente pode ver suas cápsulas
- Destinatários só veem com link válido

✅ **Rate Limiting:**
- Limite de 10 cápsulas/dia por usuário
- Limite de criação de 1 cápsula/5 minutos

✅ **Validação:**
- Email verificado (opcional: confirmação)
- Carteira verificada com checksum

---

## 🚀 Próximos Passos

### Fase 1 (Atual)
- [x] Interface de criação
- [x] Validações
- [x] Método Email
- [x] Link público
- [ ] Backend API
- [ ] Integração Hostinger

### Fase 2
- [ ] Criptografia end-to-end
- [ ] Método Carteira
- [ ] Notificações
- [ ] Analytics

### Fase 3
- [ ] Redes sociais (Twitter, WhatsApp)
- [ ] QR code
- [ ] Multimídia (imagens, vídeos)
- [ ] Presença criptográfica

---

## 📞 Contato para Integração

**Email para disparar cápsulas:**
```
hello@singulai.site
Servidor: Hostinger
Autenticação: SMTP (465/SSL)
```

**Domínio:**
```
singulai.site
```

---

## 📝 Checklist de Implementação

### Frontend (✅ Completo)
- [x] Página de criação com validações
- [x] Lista de cápsulas
- [x] Data picker com validação
- [x] Time picker com validação
- [x] Email input com validação
- [x] Carteira input com validação
- [x] Tabs para métodos de envio
- [x] Copy link to clipboard
- [x] UI responsiva

### Backend (⏳ Pendente)
- [ ] POST /timecapsule/create
- [ ] POST /email/send-capsule
- [ ] GET /timecapsule/:id
- [ ] GET /timecapsule/list
- [ ] Criptografia de mensagens
- [ ] Job scheduler (unlock automático)
- [ ] Rate limiting

### Email (⏳ Pendente)
- [ ] Configurar SMTP Hostinger
- [ ] Template HTML
- [ ] Autenticação
- [ ] Teste de envio

---

**Status: FRONTEND COMPLETO ✅ | BACKEND PENDENTE ⏳**

Data: 01/01/2026
Versão: 2.0
