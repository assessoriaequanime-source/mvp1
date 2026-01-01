import type { 
  ChatMessage, 
  ChatSession, 
  InteractionResponse,
  AvatarResponse 
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "";

class RAGService {
  private token: string | null = null;
  private activeSession: ChatSession | null = null;

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
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.message,
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

  // Session Management
  async startSession(avatarId: string): Promise<AvatarResponse<ChatSession>> {
    const result = await this.request<ChatSession>(`/chat/${avatarId}/session`, {
      method: "POST",
    });
    
    if (result.success && result.data) {
      this.activeSession = result.data;
    }
    
    return result;
  }

  async endSession(sessionId: string): Promise<AvatarResponse<void>> {
    this.activeSession = null;
    return this.request<void>(`/chat/session/${sessionId}/end`, {
      method: "POST",
    });
  }

  getActiveSession(): ChatSession | null {
    return this.activeSession;
  }

  // Chat Interaction
  async sendMessage(
    avatarId: string,
    message: string,
    sessionId?: string
  ): Promise<AvatarResponse<InteractionResponse>> {
    return this.request<InteractionResponse>(`/chat/${avatarId}/interact`, {
      method: "POST",
      body: JSON.stringify({
        message,
        sessionId: sessionId || this.activeSession?.id,
      }),
    });
  }

  // Streaming Chat (for real-time responses)
  async *streamMessage(
    avatarId: string,
    message: string,
    sessionId?: string
  ): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${API_URL}/chat/${avatarId}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: JSON.stringify({
        message,
        sessionId: sessionId || this.activeSession?.id,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error("Stream failed");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  }

  // Chat History
  async getSessionHistory(
    sessionId: string
  ): Promise<AvatarResponse<ChatMessage[]>> {
    return this.request<ChatMessage[]>(`/chat/session/${sessionId}/history`);
  }

  async getUserSessions(
    avatarId: string
  ): Promise<AvatarResponse<ChatSession[]>> {
    return this.request<ChatSession[]>(`/chat/${avatarId}/sessions`);
  }

  // Voice Interaction
  async textToSpeech(
    avatarId: string,
    text: string
  ): Promise<AvatarResponse<{ audioUrl: string }>> {
    return this.request<{ audioUrl: string }>(`/chat/${avatarId}/tts`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  async speechToText(
    audioBlob: Blob
  ): Promise<AvatarResponse<{ text: string }>> {
    const formData = new FormData();
    formData.append("audio", audioBlob);

    return this.request<{ text: string }>("/chat/stt", {
      method: "POST",
      headers: {},
      body: formData as unknown as string,
    });
  }
}

export const ragService = new RAGService();
export default ragService;
