/**
 * SingulAI Extended Hooks
 * React Query hooks para Staking, TimeCapsule, Legacy e Avatar
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

// ============= TYPES =============

export interface StakingInfo {
  totalStaked: string;
  rewardRate: string;
  lockPeriod: number;
  minStake: string;
}

export interface UserStaking {
  address: string;
  staked: string;
  rewards: string;
  lockTime: number;
  canUnstake: boolean;
}

export interface LeaderboardEntry {
  address: string;
  totalStaked: string;
  rewards: string;
  rank: number;
}

export interface TimeCapsuleInfo {
  totalCapsules: number;
  creationFee: string;
  unlockReward: string;
}

export interface TimeCapsule {
  id: string;
  owner: string;
  content: string;
  unlockDate: number;
  created: number;
  unlocked: boolean;
}

export interface LegacyInfo {
  totalLegacies: number;
  creationFee: string;
  executionReward: string;
}

export interface DigitalLegacy {
  id: string;
  owner: string;
  executor: string;
  content: string;
  unlockCondition: string;
  executed: boolean;
  created: number;
}

// ============= STAKING QUERIES =============

export function useStakingInfo() {
  return useQuery({
    queryKey: ["staking", "info"],
    queryFn: async () => {
      const response = await apiClient.get<StakingInfo>("/staking/info");
      if (response.error) throw new Error(response.error);
      return response.data!;
    },
    staleTime: 60000,
  });
}

export function useUserStaking(address: string | undefined | null) {
  return useQuery({
    queryKey: ["staking", "user", address],
    queryFn: async () => {
      const response = await apiClient.get<UserStaking>(`/staking/user/${address}`);
      if (response.error) throw new Error(response.error);
      return response.data!;
    },
    enabled: !!address,
    staleTime: 30000,
  });
}

export function useStakingLeaderboard() {
  return useQuery({
    queryKey: ["staking", "leaderboard"],
    queryFn: async () => {
      const response = await apiClient.get<LeaderboardEntry[]>("/staking/leaderboard");
      if (response.error) throw new Error(response.error);
      return response.data!;
    },
    staleTime: 60000,
  });
}

// ============= TIMECAPSULE QUERIES =============

export function useTimeCapsuleInfo() {
  return useQuery({
    queryKey: ["timecapsule", "info"],
    queryFn: async () => {
      const response = await apiClient.get<TimeCapsuleInfo>("/timecapsule/info");
      if (response.error) throw new Error(response.error);
      return response.data!;
    },
    staleTime: 60000,
  });
}

export function useUserTimeCapsules(address: string | undefined | null) {
  return useQuery({
    queryKey: ["timecapsule", "user", address],
    queryFn: async () => {
      const response = await apiClient.get<TimeCapsule[]>(`/timecapsule/user/${address}`);
      if (response.error) throw new Error(response.error);
      return response.data!;
    },
    enabled: !!address,
    staleTime: 30000,
  });
}

export function useTimeCapsule(capsuleId: string | undefined) {
  return useQuery({
    queryKey: ["timecapsule", "capsule", capsuleId],
    queryFn: async () => {
      const response = await apiClient.get<TimeCapsule>(`/timecapsule/capsule/${capsuleId}`);
      if (response.error) throw new Error(response.error);
      return response.data!;
    },
    enabled: !!capsuleId,
    staleTime: 30000,
  });
}

// ============= LEGACY QUERIES =============

export function useLegacyInfo() {
  return useQuery({
    queryKey: ["legacy", "info"],
    queryFn: async () => {
      const response = await apiClient.get<LegacyInfo>("/legacy/info");
      if (response.error) throw new Error(response.error);
      return response.data!;
    },
    staleTime: 60000,
  });
}

export function useUserLegacies(address: string | undefined | null) {
  return useQuery({
    queryKey: ["legacy", "user", address],
    queryFn: async () => {
      const response = await apiClient.get<DigitalLegacy[]>(`/legacy/user/${address}`);
      if (response.error) throw new Error(response.error);
      return response.data!;
    },
    enabled: !!address,
    staleTime: 30000,
  });
}

export function useDigitalLegacy(legacyId: string | undefined) {
  return useQuery({
    queryKey: ["legacy", "legacy", legacyId],
    queryFn: async () => {
      const response = await apiClient.get<DigitalLegacy>(`/legacy/legacy/${legacyId}`);
      if (response.error) throw new Error(response.error);
      return response.data!;
    },
    enabled: !!legacyId,
    staleTime: 30000,
  });
}

// ============= STAKING MUTATIONS =============

export function useStake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: string) => {
      const response = await apiClient.post("/staking/stake", { amount });
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Stake realizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["staking"] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao fazer stake", { description: error.message });
    },
  });
}

export function useUnstake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: string) => {
      const response = await apiClient.post("/staking/unstake", { amount });
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Unstake realizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["staking"] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao fazer unstake", { description: error.message });
    },
  });
}

export function useClaimRewards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/staking/claim-rewards", {});
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Rewards reclamados!");
      queryClient.invalidateQueries({ queryKey: ["staking"] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao reclamar rewards", { description: error.message });
    },
  });
}

// ============= TIMECAPSULE MUTATIONS =============

export function useCreateTimeCapsule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { content: string; unlockDate: number }) => {
      const response = await apiClient.post("/timecapsule/create", data);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Time Capsule criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["timecapsule"] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar capsule", { description: error.message });
    },
  });
}

export function useUnlockTimeCapsule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (capsuleId: string) => {
      const response = await apiClient.post(`/timecapsule/unlock/${capsuleId}`, {});
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Time Capsule desbloqueada!");
      queryClient.invalidateQueries({ queryKey: ["timecapsule"] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao desbloquear capsule", { description: error.message });
    },
  });
}

// ============= LEGACY MUTATIONS =============

export function useCreateLegacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      executor: string;
      content: string;
      unlockCondition: string;
    }) => {
      const response = await apiClient.post("/legacy/create", data);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Digital Legacy criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["legacy"] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar legacy", { description: error.message });
    },
  });
}

export function useExecuteLegacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (legacyId: string) => {
      const response = await apiClient.post(`/legacy/execute/${legacyId}`, {});
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Digital Legacy executada!");
      queryClient.invalidateQueries({ queryKey: ["legacy"] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao executar legacy", { description: error.message });
    },
  });
}
