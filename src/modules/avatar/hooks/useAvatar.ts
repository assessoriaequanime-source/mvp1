import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { avatarService } from "../services/avatar.service";
import type { Avatar, AvatarCreationForm, Memory, AvatarConsent } from "../types";

export function useAvatar(avatarId?: string) {
  const queryClient = useQueryClient();

  // Fetch single avatar
  const {
    data: avatar,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["avatar", avatarId],
    queryFn: async () => {
      if (!avatarId) return null;
      const result = await avatarService.getAvatar(avatarId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!avatarId,
  });

  // Fetch user's avatars
  const {
    data: userAvatars,
    isLoading: isLoadingAvatars,
  } = useQuery({
    queryKey: ["avatars", "user"],
    queryFn: async () => {
      const result = await avatarService.getUserAvatars();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
  });

  // Create avatar
  const createMutation = useMutation({
    mutationFn: (form: AvatarCreationForm) => avatarService.createAvatar(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avatars", "user"] });
    },
  });

  // Update avatar
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Avatar> }) =>
      avatarService.updateAvatar(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avatar", avatarId] });
      queryClient.invalidateQueries({ queryKey: ["avatars", "user"] });
    },
  });

  // Mint avatar on-chain
  const mintMutation = useMutation({
    mutationFn: (id: string) => avatarService.mintAvatar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avatar", avatarId] });
    },
  });

  // Deactivate avatar
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => avatarService.deactivateAvatar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avatars", "user"] });
    },
  });

  return {
    // Data
    avatar,
    userAvatars,
    
    // Loading states
    isLoading,
    isLoadingAvatars,
    isCreating: createMutation.isPending,
    isMinting: mintMutation.isPending,
    
    // Errors
    error,
    createError: createMutation.error,
    
    // Actions
    refetch,
    createAvatar: createMutation.mutateAsync,
    updateAvatar: updateMutation.mutateAsync,
    mintAvatar: mintMutation.mutateAsync,
    deactivateAvatar: deactivateMutation.mutateAsync,
  };
}

export function useAvatarMemories(avatarId: string) {
  const queryClient = useQueryClient();

  const {
    data: memories,
    isLoading,
  } = useQuery({
    queryKey: ["avatar", avatarId, "memories"],
    queryFn: async () => {
      const result = await avatarService.getMemories(avatarId);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!avatarId,
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => avatarService.uploadMemory(avatarId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avatar", avatarId, "memories"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (memoryId: string) => avatarService.deleteMemory(avatarId, memoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avatar", avatarId, "memories"] });
    },
  });

  return {
    memories,
    isLoading,
    isUploading: uploadMutation.isPending,
    uploadMemories: uploadMutation.mutateAsync,
    deleteMemory: deleteMutation.mutateAsync,
  };
}
