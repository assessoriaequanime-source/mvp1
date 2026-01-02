/**
 * Serviço de Autenticação Simplificado
 * Implementa apenas cadastro/login por email
 */

import { apiClient } from "@/lib/api-client";

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
}

export interface SendCodeRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

class AuthService {
  private tokenKey = "auth_token";
  private emailKey = "user_email";

  /**
   * Obter token armazenado
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Obter email armazenado
   */
  getEmail(): string | null {
    return localStorage.getItem(this.emailKey);
  }

  /**
   * Verificar se usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Enviar código de verificação para email
   * @param email - Email do usuário
   */
  async sendVerificationCode(email: string): Promise<void> {
    try {
      // TODO: Descomentar quando backend estiver pronto
      // const response = await apiClient.post<{ message: string }>("/auth/send-code", {
      //   email,
      // });
      
      // Mock: sempre retorna sucesso
      console.log("📧 Código de verificação seria enviado para:", email);
      return Promise.resolve();
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : "Failed to send verification code"
      );
    }
  }

  /**
   * Verificar código e criar/fazer login na conta
   * @param email - Email do usuário
   * @param code - Código de verificação
   */
  async verifyCode(email: string, code: string): Promise<AuthResponse> {
    try {
      // TODO: Descomentar quando backend estiver pronto
      // const response = await apiClient.post<AuthResponse>("/auth/verify-code", {
      //   email,
      //   code,
      // });
      // const { token, user } = response.data;
      
      // Mock: simular resposta do servidor
      const token = `token_${Date.now()}_${Math.random()}`;
      const user = {
        id: `user_${Date.now()}`,
        email,
        createdAt: new Date().toISOString(),
      };

      // Armazenar token e email
      this.setToken(token);
      this.setEmail(email);

      console.log("✅ Usuário autenticado com sucesso:", user);
      return { token, user };
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : "Failed to verify code"
      );
    }
  }

  /**
   * Armazenar token
   */
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Armazenar email
   */
  setEmail(email: string): void {
    localStorage.setItem(this.emailKey, email);
  }

  /**
   * Fazer logout
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.emailKey);
  }

  /**
   * Limpar dados de autenticação (em caso de erro)
   */
  clearAuth(): void {
    this.logout();
  }
}

export const authService = new AuthService();
export default authService;
