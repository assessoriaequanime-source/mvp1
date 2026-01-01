/**
 * Configuração centralizada da aplicação
 * Gerencia URLs da API, constantes e variáveis de ambiente
 */

export const config = {
  // API Backend
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://72.60.147.56:3004/api/v1',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    retries: parseInt(import.meta.env.VITE_API_RETRIES || '3'),
  },

  // Blockchain
  blockchain: {
    chainId: parseInt(import.meta.env.VITE_CHAIN_ID || '11155111'), // Sepolia
    rpcUrl: import.meta.env.VITE_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
  },

  // App
  app: {
    name: import.meta.env.VITE_APP_NAME || 'SingulAI',
    environment: import.meta.env.MODE || 'development',
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  },

  // Smart Contracts
  contracts: {
    sglToken: import.meta.env.VITE_SGL_TOKEN_ADDRESS || '0xF281a68ae5Baf227bADC1245AC5F9B2F53b7EDe1',
    avatarBase: import.meta.env.VITE_AVATAR_BASE_ADDRESS || '0x95F531cafca627A447C0F1119B8b6aCC730163E5',
    avatarWalletLink: import.meta.env.VITE_AVATAR_WALLET_LINK_ADDRESS || '0x9F475e5D174577f2FB17a9D94a8093e2D8c9ED41',
    timeCapsule: import.meta.env.VITE_TIMECAPSULE_ADDRESS || '0x6A58aD664071d450cF7e794Dac5A13e3a1DeD172',
    digitalLegacy: import.meta.env.VITE_LEGACY_ADDRESS || '0x0Ee8f5dC7E9BC9AF344eB987B8363b33E737b757',
  },
} as const;

// Tipos de exportação
export type Config = typeof config;

// Função para log de configuração (apenas em desenvolvimento)
if (config.app.isDevelopment) {
  console.log('🔧 Configuração carregada:', {
    apiBaseUrl: config.api.baseUrl,
    environment: config.app.environment,
    chainId: config.blockchain.chainId,
  });
}
