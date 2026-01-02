/**
 * Hook useAuth - Gerencia autenticação por email
 */

import { useState, useCallback } from "react";
import { authService } from "@/services/auth.service";

interface UseAuthReturn {
  isAuthenticated: boolean;
  email: string | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Funções
  sendVerificationCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendVerificationCode = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.sendVerificationCode(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyCode = useCallback(async (email: string, code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.verifyCode(email, code);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isAuthenticated: authService.isAuthenticated(),
    email: authService.getEmail(),
    token: authService.getToken(),
    isLoading,
    error,
    sendVerificationCode,
    verifyCode,
    logout,
    clearError,
  };
}
