import { useState, useCallback, useRef } from "react";
import { ragService } from "../services/rag.service";
import type { ChatMessage, ChatSession } from "../types";

export function useChat(avatarId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  
  const streamAbortRef = useRef<AbortController | null>(null);

  // Start new session
  const startSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ragService.startSession(avatarId);
      if (result.success && result.data) {
        setSession(result.data);
        setMessages([]);
        return result.data;
      } else {
        throw new Error(result.error || "Failed to start session");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [avatarId]);

  // End session
  const endSession = useCallback(async () => {
    if (!session) return;
    
    await ragService.endSession(session.id);
    setSession(null);
    setMessages([]);
  }, [session]);

  // Send message (non-streaming)
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const result = await ragService.sendMessage(avatarId, content, session?.id);
      
      if (result.success && result.data) {
        setMessages((prev) => [...prev, result.data!.message]);
      } else {
        throw new Error(result.error || "Failed to get response");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "system",
          content: "Sorry, I couldn't process your message. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [avatarId, session]);

  // Send message (streaming)
  const sendMessageStream = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    setIsStreaming(true);
    setError(null);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add placeholder for avatar response
    const avatarMessageId = `avatar-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: avatarMessageId,
        role: "avatar",
        content: "",
        timestamp: Date.now(),
      },
    ]);

    try {
      let fullContent = "";
      
      for await (const chunk of ragService.streamMessage(avatarId, content, session?.id)) {
        fullContent += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === avatarMessageId
              ? { ...msg, content: fullContent }
              : msg
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Stream failed");
    } finally {
      setIsStreaming(false);
    }
  }, [avatarId, session]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    // State
    messages,
    session,
    isLoading,
    isStreaming,
    error,
    
    // Actions
    startSession,
    endSession,
    sendMessage,
    sendMessageStream,
    clearMessages,
  };
}

// Voice chat hook
export function useVoiceChat(avatarId: string) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        setIsProcessing(true);

        try {
          const result = await ragService.speechToText(audioBlob);
          if (result.success && result.data) {
            resolve(result.data.text);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
    });
  }, []);

  const playResponse = useCallback(async (text: string) => {
    setIsProcessing(true);
    
    try {
      const result = await ragService.textToSpeech(avatarId, text);
      if (result.success && result.data) {
        setAudioUrl(result.data.audioUrl);
        const audio = new Audio(result.data.audioUrl);
        await audio.play();
      }
    } catch (err) {
      console.error("TTS failed:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [avatarId]);

  return {
    isRecording,
    isProcessing,
    audioUrl,
    startRecording,
    stopRecording,
    playResponse,
  };
}
