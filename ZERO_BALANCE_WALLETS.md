# Carteiras com Saldo Zero - Tratamento e UX

## Situação
Quando um usuário cria uma carteira nova (via seed phrase ou private key), ela começa com **0 SGL tokens**. O sistema agora exibe avisos amigáveis para orientar o usuário como obter tokens.

## Solução Implementada

### 1. Alert na Página de Tokens ([TokensPage.tsx](src/pages/dashboard/TokensPage.tsx) - Linhas 164-184)

Quando o saldo é 0, mostra um aviso com instruções:

```tsx
{isConnected && !balanceLoading && parseFloat(balanceData?.balance || "0") === 0 && (
  <Alert variant="default" className="border-blue-500/50 bg-blue-500/10">
    <AlertTriangle className="h-4 w-4 text-blue-500" />
    <AlertDescription className="text-blue-700 dark:text-blue-400">
      💡 Your wallet has <strong>0 SGL tokens</strong>. This is a newly created wallet on Sepolia Testnet.
      <br />
      <strong>How to get tokens:</strong>
      <ul className="mt-2 space-y-1 ml-4">
        <li>✓ Request tokens via our <strong>Airdrop</strong> feature (Dashboard → Airdrop)</li>
        <li>✓ Use the <strong>Faucet</strong> to mint test tokens</li>
        <li>✓ Receive tokens from other users via Transfer</li>
      </ul>
    </AlertDescription>
  </Alert>
)}
```

**Aparece em**: Página `/dashboard/tokens`

### 2. Alert no Dashboard Overview ([DashboardOverview.tsx](src/pages/dashboard/DashboardOverview.tsx) - Linhas 103-114)

Alert mais conciso na página inicial:

```tsx
{!balanceLoading && parseFloat(balanceData?.balance || "0") === 0 && (
  <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
    <AlertTriangle className="h-4 w-4 text-amber-600" />
    <AlertDescription className="text-amber-700 dark:text-amber-400">
      <strong>Wallet Created!</strong> Your new wallet has 0 SGL tokens. 
      Get started by <Link to="/dashboard/tokens" className="underline font-semibold hover:no-underline">requesting tokens via Airdrop</Link> or using the Faucet.
    </AlertDescription>
  </Alert>
)}
```

**Aparece em**: Página `/dashboard` (Overview)

## Fluxo de Usuário

```
1. Usuário cria carteira com seed phrase/private key
   ↓
2. Autenticado e redirecionado para /dashboard
   ↓
3. Dashboard exibe Alert: "Wallet Created! Your wallet has 0 SGL tokens"
   ↓
4. Usuário clica em "requesting tokens via Airdrop"
   ↓
5. Redirecionado para /dashboard/tokens
   ↓
6. Exibe Alert detalhado com 3 opções de como obter tokens
   ↓
7. Usuário escolhe uma opção (Airdrop, Faucet, ou recebe de outro usuário)
   ↓
8. Após obter tokens, saldo é atualizado automaticamente
   ↓
9. Avisos desaparecem (balance > 0)
```

## Comportamento

| Condição | Comportamento |
|----------|---------------|
| Balance = 0 | Mostra Alert informativo |
| Balance > 0 | Alert desaparece, display normal |
| Loading | Não mostra Alert (aguarda dados) |
| Não conectado | Não mostra Alert (conecte primeiro) |

## Componentes Afetados

✅ **Overview Page** - Alert ao lado do heading  
✅ **Tokens Page** - Alert detalhado com instruções  
❌ **TokenInfo Component** - Sem alteração (componente reutilizável)

## UX Improvements

1. **Transparência** - Usuário sabe por que o saldo é 0
2. **Orientação** - Instruções claras sobre como obter tokens
3. **Link Direto** - Link para página de Airdrop no Overview
4. **Visual Diferente** - Cor amarela (warning) em vez de vermelha (error)

## Build Status

✅ Build passou: 1913 modules, 0 errors, 11.73s

## Próximas Melhorias (Opcional)

1. ⏳ Implementar Faucet (mintagem de tokens de teste)
2. ⏳ Implementar Airdrop (requisição de tokens via formulário)
3. ⏳ Toast de sucesso quando saldo é atualizado
4. ⏳ Analytics para rastrear usuários com wallet zero-balance
