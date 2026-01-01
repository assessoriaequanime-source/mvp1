// Avatar Core Types
export interface Avatar {
  id: string;
  tokenId?: number;
  creator: string;
  name: string;
  ipfsCID: string;
  createdAt: number;
  isActive: boolean;
  metadata: AvatarMetadata;
}

export interface AvatarMetadata {
  displayName: string;
  aliases: string[];
  language: "en" | "pt" | "es";
  tone: AvatarTone;
  voiceId?: string;
  profileImage?: string;
  description?: string;
}

export interface AvatarTone {
  formality: "casual" | "neutral" | "formal";
  warmth: number; // 1-10
  humor: number; // 1-10
  verbosity: "concise" | "balanced" | "detailed";
}

// Memory & RAG Types
export interface Memory {
  id: string;
  avatarId: string;
  type: MemoryType;
  content: string;
  embedding?: number[];
  source: MemorySource;
  timestamp: number;
  metadata: Record<string, unknown>;
}

export type MemoryType = "text" | "audio" | "image" | "document";

export interface MemorySource {
  filename?: string;
  url?: string;
  uploadedAt: number;
  size?: number;
  mimeType?: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: "user" | "avatar" | "system";
  content: string;
  timestamp: number;
  metadata?: ChatMetadata;
}

export interface ChatMetadata {
  sourcesUsed?: string[];
  confidence?: number;
  processingTime?: number;
  voiceGenerated?: boolean;
}

export interface ChatSession {
  id: string;
  avatarId: string;
  userId: string;
  messages: ChatMessage[];
  startedAt: number;
  lastActivity: number;
  isActive: boolean;
}

// Consent & Privacy
export interface AvatarConsent {
  avatarId: string;
  voiceCloning: boolean;
  publicInteraction: boolean;
  commercialUse: boolean;
  dataRetention: "30days" | "1year" | "forever";
  updatedAt: number;
  signature?: string;
}

// Creation Flow
export interface AvatarCreationForm {
  step: 1 | 2 | 3 | 4 | 5;
  basicInfo: {
    name: string;
    aliases: string[];
    language: string;
    description: string;
  };
  personality: {
    tone: AvatarTone;
    traits: string[];
    avoidTopics: string[];
  };
  materials: {
    files: File[];
    textSamples: string[];
  };
  consent: AvatarConsent;
}

// API Response Types
export interface AvatarResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface InteractionResponse {
  message: ChatMessage;
  sources: string[];
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}
