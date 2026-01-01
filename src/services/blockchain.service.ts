/**
 * SingulAI Blockchain API Service
 * Conecta com a API NestJS na VPS usando cliente HTTP centralizado
 */

import { apiClient, ApiResponse } from '../lib/api-client';

export interface BlockchainStatus {
  status: string;
  network: string;
  chainId: number;
  currentBlock: number;
  gasPrice: string;
  walletAddress: string;
  avatarContract: string;
  sglToken: string;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  totalSupply: string;
}

export interface BalanceResponse {
  balance: string;
}

export interface TransferRequest {
  to: string;
  amount: string;
}

export interface TransactionResponse {
  success: boolean;
  txHash?: string;
  message?: string;
  error?: string;
}

class BlockchainService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await apiClient.request<T>(`/blockchain${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data as T;
  }

  // Health check
  async health(): Promise<{ status: string; service: string }> {
    return this.request("/health");
  }

  // Network status
  async getStatus(): Promise<BlockchainStatus> {
    return this.request("/status");
  }

  // Wallet info
  async getWalletInfo(address: string): Promise<{
    address: string;
    ethBalance: string;
    sglBalance: string;
  }> {
    return this.request(`/wallet/${address}`);
  }

  // SGL Token
  async getSglInfo(): Promise<TokenInfo> {
    return this.request("/sgl/info");
  }

  async getSglBalance(address: string): Promise<BalanceResponse> {
    return this.request(`/sgl/balance/${address}`);
  }

  async transferSgl(data: TransferRequest): Promise<TransactionResponse> {
    return this.request("/sgl/transfer", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async mintSgl(data: TransferRequest): Promise<TransactionResponse> {
    return this.request("/sgl/mint", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async airdropSgl(data: TransferRequest): Promise<TransactionResponse> {
    return this.request("/sgl/airdrop", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Avatar NFT
  async mintAvatar(to: string): Promise<TransactionResponse> {
    return this.request("/avatar/mint", {
      method: "POST",
      body: JSON.stringify({ to }),
    });
  }

  async getAvatarBalance(address: string): Promise<BalanceResponse> {
    return this.request(`/avatar/balance/${address}`);
  }
}

export const blockchainService = new BlockchainService();
export default blockchainService;
