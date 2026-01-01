/**
 * SingulAI Blockchain Hooks
 * React Query hooks para integração com API
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blockchainService, type TransferRequest } from "@/services/blockchain.service";
import { toast } from "sonner";

// Network Status
export function useBlockchainStatus() {
  return useQuery({
    queryKey: ["blockchain", "status"],
    queryFn: () => blockchainService.getStatus(),
    refetchInterval: 15000, // Atualiza a cada 15s
    staleTime: 10000,
  });
}

export function useBlockchainHealth() {
  return useQuery({
    queryKey: ["blockchain", "health"],
    queryFn: () => blockchainService.health(),
    staleTime: 30000,
  });
}

// SGL Token
export function useSglTokenInfo() {
  return useQuery({
    queryKey: ["sgl", "info"],
    queryFn: () => blockchainService.getSglInfo(),
    staleTime: 60000,
  });
}

export function useSglBalance(address: string | undefined | null) {
  return useQuery({
    queryKey: ["sgl", "balance", address],
    queryFn: () => blockchainService.getSglBalance(address!),
    enabled: !!address,
    staleTime: 30000,
  });
}

// Wallet Info
export function useWalletInfo(address: string | undefined | null) {
  return useQuery({
    queryKey: ["wallet", "info", address],
    queryFn: () => blockchainService.getWalletInfo(address!),
    enabled: !!address,
    staleTime: 30000,
  });
}

// Avatar NFT
export function useAvatarBalance(address: string | undefined | null) {
  return useQuery({
    queryKey: ["avatar", "balance", address],
    queryFn: () => blockchainService.getAvatarBalance(address!),
    enabled: !!address,
    staleTime: 30000,
  });
}

// Mutations
export function useSglTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferRequest) => blockchainService.transferSgl(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Transfer successful!", {
          description: result.txHash ? `TX: ${result.txHash.slice(0, 10)}...` : undefined,
        });
        queryClient.invalidateQueries({ queryKey: ["sgl"] });
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
      } else {
        toast.error("Transfer failed", { description: result.error });
      }
    },
    onError: (error: Error) => {
      toast.error("Transfer failed", { description: error.message });
    },
  });
}

export function useSglAirdrop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferRequest) => blockchainService.airdropSgl(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Airdrop successful!", {
          description: result.txHash ? `TX: ${result.txHash.slice(0, 10)}...` : undefined,
        });
        queryClient.invalidateQueries({ queryKey: ["sgl"] });
      } else {
        toast.error("Airdrop failed", { description: result.error });
      }
    },
    onError: (error: Error) => {
      toast.error("Airdrop failed", { description: error.message });
    },
  });
}

export function useSglMint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferRequest) => blockchainService.mintSgl(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Mint successful!", {
          description: result.txHash ? `TX: ${result.txHash.slice(0, 10)}...` : undefined,
        });
        queryClient.invalidateQueries({ queryKey: ["sgl"] });
      } else {
        toast.error("Mint failed", { description: result.error });
      }
    },
    onError: (error: Error) => {
      toast.error("Mint failed", { description: error.message });
    },
  });
}

export function useAvatarMint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (to: string) => blockchainService.mintAvatar(to),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Avatar NFT minted!", {
          description: result.txHash ? `TX: ${result.txHash.slice(0, 10)}...` : undefined,
        });
        queryClient.invalidateQueries({ queryKey: ["avatar"] });
      } else {
        toast.error("Mint failed", { description: result.error });
      }
    },
    onError: (error: Error) => {
      toast.error("Mint failed", { description: error.message });
    },
  });
}
