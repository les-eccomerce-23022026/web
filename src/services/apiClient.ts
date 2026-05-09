import type { RootState } from '../store/index';
import { buildUrl, responseToResult, rethrowNetworkError } from '../utils/httpUtils';

/**
 * Cliente API centralizado para chamadas à API com tratamento de erros.
 * - Cookie HttpOnly (JWT): `credentials: 'include'` na mesma origem (proxy `/api`).
 * - Bearer: apenas quando há token JWT no Redux (ex.: testes).
 * - 401 em rotas autenticadas: encerra sessão (logoutSession). Login com credenciais inválidas não dispara logout global.
 */
export class ApiClient {
  private static readonly TIMEOUT_MS = 10000; // 10 segundos

  private static prepararHeaders(fetchOptions: RequestInit, token: string | null): Headers {
    const headers = new Headers(fetchOptions.headers);
    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (process.env.NEXT_PUBLIC_USE_TEST_DB === 'true') {
      headers.set('x-use-test-db', 'true');
    }
    // Se o Cypress definiu a flag global para usar banco de testes, adiciona o header
    if (!headers.has('x-use-test-db') && typeof window !== 'undefined' && window.__USE_TEST_DB__) {
      headers.set('x-use-test-db', 'true');
    }

    if (token && token.split('.').length === 3) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private static logRequest(method: string | undefined, url: string, hasToken: boolean, hasTestDbHeader: boolean): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SENIOR-DEBUG] API Request: ${method || 'GET'} ${url}`, {
        hasToken,
        hasTestDbHeader,
        windowTestDbFlag: typeof window !== 'undefined' ? window.__USE_TEST_DB__ : 'N/A'
      });
    }
  }

  private static logResponse(response: Response, url: string): void {
    if (process.env.NODE_ENV === 'development') {
      const clone = response.clone();
      let bodyText = '';
      try {
        void clone.text().then((text) => {
          bodyText = text;
        });
      } catch {
        bodyText = '(could not read body)';
      }

      console.log(`[SENIOR-DEBUG] API Response: ${response.status} ${url}`, {
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        body: bodyText.length > 500 ? bodyText.substring(0, 500) + '...' : bodyText
      });
    }
  }

  private static async request<T>(endpoint: string, options: RequestInit & { params?: Record<string, string> } = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = buildUrl(endpoint, params);

    const { store } = await import('../store/index');
    const state = store.getState() as RootState;
    const token = state.auth.token;

    const headers = this.prepararHeaders(fetchOptions, token);

    const config: RequestInit = {
      ...fetchOptions,
      headers,
      credentials: 'include',
    };

    const hasTestDbHeader = headers.get('x-use-test-db') === 'true';
    this.logRequest(config.method, url, !!token, hasTestDbHeader);

    try {
      // Adicionar timeout para evitar loading infinito
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      this.logResponse(response, url);
      return await responseToResult<T>(url, response);
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[SENIOR-DEBUG] API Network Error: ${url}`, error);
      }
      return rethrowNetworkError(error);
    }
  }

  static get<T>(url: string, params?: Record<string, string>) {
    return this.request<T>(url, { method: 'GET', params });
  }

  static post<T>(url: string, body?: unknown) {
    return this.request<T>(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  static put<T>(url: string, body?: unknown) {
    return this.request<T>(url, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  static patch<T>(url: string, body?: unknown) {
    return this.request<T>(url, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  static delete<T>(url: string) {
    return this.request<T>(url, { method: 'DELETE' });
  }
}
