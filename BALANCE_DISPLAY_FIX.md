# Balance Display Fix - Resumo da Solução

## Problema
Os saldos SGL não estavam aparecendo em nenhuma página do dashboard (Overview, Tokens, Staking, etc.).

## Raiz do Problema
O `useWallet()` hook estava tentando ler o endereço da carteira apenas via `eth_accounts` do MetaMask. No entanto, como a autenticação foi alterada para usar **seed phrase** ou **private key** (removendo a necessidade de conectar MetaMask), o hook não conseguia encontrar nenhum endereço.

### Fluxo Quebrado:
1. Usuário autentica com seed phrase ou private key na página `/connect`
2. Endereço é armazenado em `localStorage` com chave `"user_wallet"`
3. Usuário navega para `/dashboard`
4. Dashboard tenta usar `const { address } = useWallet()`
5. **PROBLEMA**: `useWallet()` procura apenas `eth_accounts` do MetaMask (vazio)
6. `address` retorna `null`
7. `useSglBalance(address)` não é executado porque tem `enabled: !!address`
8. Balances não aparecem

## Solução
Modificar `useWallet()` para verificar `localStorage` **primeiro** antes de tentar conectar ao MetaMask.

### Mudanças Realizadas

#### 1. [useWallet.ts](src/hooks/useWallet.ts) - Linha 28-48
Alterou a função `checkConnection` para:
- Primeiro verificar se existe `user_wallet` no localStorage
- Se existir, usar esse address (da autenticação com seed/key)
- Se não existir, fazer fallback para MetaMask

```typescript
const checkConnection = async () => {
  // First, check stored wallet from seed phrase or private key auth
  const storedAddress = localStorage.getItem("user_wallet");
  
  if (storedAddress) {
    // Use stored address from authentication
    setState({
      address: storedAddress,
      balance: null, // Será fetchado via React Query
      chainId: SEPOLIA_CHAIN_ID,
      isConnected: true,
      isConnecting: false,
    });
    return;
  }

  // Fallback: check MetaMask connection
  // ... resto do código
};
```

#### 2. [dashboard-layout.tsx](src/components/dashboard/dashboard-layout.tsx) - Linha 36-46
Simplificou para usar `address` do `useWallet()` (que agora lê localStorage):

```typescript
// ANTES:
const walletAddress = localStorage.getItem("user_wallet") || "";
const walletData = {
  isConnected: !!walletAddress,
  address: walletAddress,
  // ...
};

// DEPOIS:
const walletData = {
  isConnected: !!address,
  address: address || "",
  balance: balanceData?.balance || "0.00",
  // ...
};
```

## Fluxo Agora Corrigido:
1. ✅ Usuário autentica com seed phrase ou private key
2. ✅ Endereço armazenado em `localStorage["user_wallet"]`
3. ✅ Dashboard carrega, `useWallet()` lê localStorage
4. ✅ `address` agora tem o valor correto
5. ✅ `useSglBalance(address)` é executado (`enabled: !!address` = true)
6. ✅ Hook faz request à API: `GET /sgl/balance/{address}`
7. ✅ Balances são exibidos corretamente

## Componentes Afetados (Agora Consertados)
- [DashboardOverview.tsx](src/pages/dashboard/DashboardOverview.tsx) - Mostra balance na stat card
- [TokenInfo.tsx](src/components/dashboard/TokenInfo.tsx) - Mostra balance no card de token info
- [TokensPage.tsx](src/pages/dashboard/TokensPage.tsx) - Mostra balance no transfer form
- [StakingPage.tsx](src/pages/dashboard/StakingPage.tsx) - Usa dados de staking (dependente de address)
- [DashboardLayout.tsx](src/components/dashboard/dashboard-layout.tsx) - Header com balance
- [WalletButton.tsx](src/components/dashboard/WalletButton.tsx) - Usa balance do context

## Build Status
✅ Build passou: 1913 modules, 0 errors, 11.72s

## Próximos Passos
1. ✅ Testar se balances aparecem no dashboard
2. ✅ Verificar se dados vêm da API corretamente
3. ✅ Validar em todos os componentes (Overview, Tokens, Staking)
4. ⏳ Continuar revisão das outras páginas (Time Capsule, Legacy, etc)
