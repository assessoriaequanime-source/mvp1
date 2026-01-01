import type { 
  Avatar, 
  AvatarCreationForm, 
  AvatarResponse, 
  AvatarConsent,
  Memory 
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "";

class AvatarService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<AvatarResponse<T>> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Request failed",
          timestamp: Date.now(),
        };
      }

      return {
        success: true,
        data,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
        timestamp: Date.now(),
      };
    }
  }

  // Avatar CRUD
  async createAvatar(form: AvatarCreationForm): Promise<AvatarResponse<Avatar>> {
    return this.request<Avatar>("/avatars", {
      method: "POST",
      body: JSON.stringify(form),
    });
  }

  async getAvatar(id: string): Promise<AvatarResponse<Avatar>> {
    return this.request<Avatar>(`/avatars/${id}`);
  }

  async getUserAvatars(): Promise<AvatarResponse<Avatar[]>> {
    return this.request<Avatar[]>("/avatars/me");
  }

  async updateAvatar(
    id: string,
    updates: Partial<Avatar>
  ): Promise<AvatarResponse<Avatar>> {
    return this.request<Avatar>(`/avatars/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async deactivateAvatar(id: string): Promise<AvatarResponse<void>> {
    return this.request<void>(`/avatars/${id}/deactivate`, {
      method: "POST",
    });
  }

  // Memory Management
  async uploadMemory(
    avatarId: string,
    files: File[]
  ): Promise<AvatarResponse<Memory[]>> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return this.request<Memory[]>(`/avatars/${avatarId}/memories`, {
      method: "POST",
      headers: {}, // Let browser set Content-Type for FormData
      body: formData as unknown as string,
    });
  }

  async getMemories(avatarId: string): Promise<AvatarResponse<Memory[]>> {
    return this.request<Memory[]>(`/avatars/${avatarId}/memories`);
  }

  async deleteMemory(
    avatarId: string,
    memoryId: string
  ): Promise<AvatarResponse<void>> {
    return this.request<void>(`/avatars/${avatarId}/memories/${memoryId}`, {
      method: "DELETE",
    });
  }

  // Consent Management
  async updateConsent(
    avatarId: string,
    consent: AvatarConsent
  ): Promise<AvatarResponse<AvatarConsent>> {
    return this.request<AvatarConsent>(`/avatars/${avatarId}/consent`, {
      method: "PUT",
      body: JSON.stringify(consent),
    });
  }

  // On-chain Operations
  async mintAvatar(avatarId: string): Promise<AvatarResponse<{ txHash: string; tokenId: number }>> {
    return this.request<{ txHash: string; tokenId: number }>(
      `/avatars/${avatarId}/mint`,
      { method: "POST" }
    );
  }

  async getOnChainData(tokenId: number): Promise<AvatarResponse<{
    creator: string;
    ipfsCID: string;
    creationTime: number;
    isActive: boolean;
  }>> {
    return this.request(`/avatars/onchain/${tokenId}`);
  }
}

export const avatarService = new AvatarService();
export default avatarService;
