# 📝 Autenticação Simplificada por Email

## Overview

O sistema de autenticação foi simplificado para suportar **apenas cadastro e login por email**. Removemos suporte a wallet connect, social login e criação manual de wallet.

---

## 🔄 Fluxo de Autenticação

### 1. **Envio de Email** (Step: "email")
- Usuário insere seu email
- Sistema valida formato de email
- Código de verificação é enviado para o email
- Usuário avança para "verify"

### 2. **Verificação de Código** (Step: "verify")
- Usuário insere o código recebido (6 dígitos)
- Código é validado no backend
- Conta é criada/encontrada automaticamente
- Token JWT é retornado

### 3. **Sucesso** (Step: "success")
- Usuário vê confirmação
- Sistema redireciona para `/dashboard` automaticamente
- Token é armazenado em `localStorage`

---

## 📁 Estrutura de Arquivos

```
src/
├── pages/
│   └── Connect.tsx              # Página de cadastro/login
├── services/
│   └── auth.service.ts          # Lógica de autenticação
└── hooks/
    └── useAuth.ts               # Hook customizado
```

---

## 🔌 Serviço de Autenticação

### `auth.service.ts`

#### `sendVerificationCode(email: string): Promise<void>`
Envia código de verificação para o email.

```typescript
import { authService } from "@/services/auth.service";

await authService.sendVerificationCode("user@example.com");
```

#### `verifyCode(email: string, code: string): Promise<AuthResponse>`
Verifica código e cria/faz login na conta.

```typescript
const response = await authService.verifyCode("user@example.com", "123456");
// response.token -> JWT token
// response.user -> { id, email, createdAt }
```

#### `getToken(): string | null`
Obtém token armazenado.

```typescript
const token = authService.getToken();
```

#### `isAuthenticated(): boolean`
Verifica se usuário está autenticado.

```typescript
if (authService.isAuthenticated()) {
  // Usuário está logado
}
```

#### `logout(): void`
Faz logout e limpa dados locais.

```typescript
authService.logout();
```

---

## 🎣 Hook `useAuth`

### Usage

```typescript
import { useAuth } from "@/hooks/useAuth";

export function MyComponent() {
  const {
    isAuthenticated,
    email,
    token,
    isLoading,
    error,
    sendVerificationCode,
    verifyCode,
    logout,
    clearError,
  } = useAuth();

  // Enviar código
  const handleSendCode = async () => {
    try {
      await sendVerificationCode("user@example.com");
    } catch (err) {
      console.error(err);
    }
  };

  // Verificar código
  const handleVerifyCode = async () => {
    try {
      await verifyCode("user@example.com", "123456");
    } catch (err) {
      console.error(err);
    }
  };

  // Logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Logado como: {email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={handleSendCode}>Entrar com Email</button>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

---

## 🔐 Local Storage

### Chaves
- `auth_token` - JWT token de autenticação
- `user_email` - Email do usuário logado

### Exemplo
```typescript
// Após login bem-sucedido:
localStorage.getItem("auth_token"); // "token_1234567890..."
localStorage.getItem("user_email"); // "user@example.com"
```

---

## 📝 Página de Cadastro/Login (`Connect.tsx`)

### Props do Component
```typescript
type SignupStep = "email" | "verify" | "success";
```

### States
- `step` - Etapa atual do fluxo
- `email` - Email inserido
- `verificationCode` - Código inserido
- `isLoading` - Estado de carregamento
- `userEmail` - Email confirmado

### Validações
✅ Email válido (regex)
✅ Código com mínimo 4 caracteres
✅ Campos obrigatórios preenchidos

---

## 🔌 Integração com Backend

### Endpoints esperados

#### 1. Enviar código
```
POST /auth/send-code
Body: { email: string }
Response: { message: string }
```

#### 2. Verificar código
```
POST /auth/verify-code
Body: { email: string, code: string }
Response: {
  token: string,
  user: { id: string, email: string, createdAt: string }
}
```

### Como integrar

**Passo 1:** Descomentar chamadas de API em `auth.service.ts`

```typescript
// Antes (mock):
console.log("📧 Código seria enviado para:", email);

// Depois (real):
const response = await apiClient.post("/auth/send-code", { email });
```

**Passo 2:** Validar responses esperadas

---

## 🧪 Testes Manual

### Fluxo completo
1. Ir para `/connect`
2. Inserir email válido (ex: `test@example.com`)
3. Clicar "Send Verification Code"
4. Inserir código (qualquer 6 dígitos)
5. Clicar "Verify & Create Account"
6. Aguardar redirecionamento para `/dashboard`

### Validações
- Email vazio → erro
- Email inválido → erro
- Código vazio → erro
- Código < 4 caracteres → erro

---

## ❌ Removed Features

Removidas para simplificação:

- ❌ **Wallet Connect** (MetaMask, WalletConnect, Coinbase)
- ❌ **Social Login** (Google, Apple)
- ❌ **Manual Wallet Creation** (recovery phrase, password)
- ❌ **Multiple auth methods** (agora apenas email)

---

## 📋 Checklist de Implementação

- [x] Página Connect simplificada
- [x] Serviço de autenticação
- [x] Hook useAuth
- [x] Validações de email
- [x] Fluxo de verificação
- [x] Armazenamento local
- [ ] Integração com backend
- [ ] Testes E2E
- [ ] Proteção de rotas (PrivateRoute)

---

## 🚀 Próximos Passos

1. **Integrar com Backend**
   - Implementar endpoints `/auth/send-code` e `/auth/verify-code`
   - Retornar JWT token válido

2. **Proteção de Rotas**
   - Criar componente `PrivateRoute`
   - Redirecionar usuários não autenticados para `/connect`

3. **Refresh Token**
   - Implementar token refresh automático
   - Renovar token antes de expirar

4. **Testes E2E**
   - Testar todo fluxo de signup/login
   - Testar validações e mensagens de erro

---

**Data de Criação:** 01/01/2026  
**Status:** ✅ Pronto para integração com backend
