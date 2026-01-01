/**
 * Cliente HTTP centralizado com retry automático, timeout e tratamento de erros
 */

import { config } from './config';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetries: number;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.defaultTimeout = config.api.timeout;
    this.defaultRetries = config.api.retries;
  }

  /**
   * Faz requisição HTTP com retry automático
   */
  async request<T = unknown>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = options.timeout || this.defaultTimeout;
    const retries = options.retries ?? this.defaultRetries;
    const retryDelay = options.retryDelay || 1000;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, options, timeout);

        if (!response.ok) {
          const errorData = await this.parseResponse(response);
          console.error(`❌ API Error [${response.status}]:`, errorData);
          
          return {
            error: errorData.message || errorData.error || 'Erro desconhecido',
            status: response.status,
          };
        }

        const data = await this.parseResponse(response);
        return { data: data as T, status: response.status };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Não retentar em erros de parsing ou últimas tentativas
        if (attempt === retries) {
          break;
        }

        // Aguardar antes de retentar (backoff exponencial)
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    const errorMessage = lastError?.message || 'Falha na requisição';
    console.error(`❌ Falha após ${retries + 1} tentativas:`, errorMessage);

    return {
      error: errorMessage,
      status: 0,
    };
  }

  /**
   * Requisição GET
   */
  async get<T = unknown>(endpoint: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * Requisição POST
   */
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Requisição PATCH
   */
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Requisição PUT
   */
  async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Requisição DELETE
   */
  async delete<T = unknown>(endpoint: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Fetch com timeout
   */
  private fetchWithTimeout(url: string, options: FetchOptions, timeoutMs: number): Promise<Response> {
    return Promise.race([
      fetch(url, options),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout após ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  /**
   * Parse resposta (JSON ou texto)
   */
  private async parseResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }

  /**
   * Atualizar URL base (útil para testes ou runtime config)
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Obter URL base atual
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Singleton instance
export const apiClient = new ApiClient();

export default apiClient;
