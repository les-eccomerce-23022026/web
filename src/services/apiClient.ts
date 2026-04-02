import type { RootState, AppDispatch } from '@/store';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

type ApiErrorBody = {
  mensagem?: string;
  erro?: string;
};

function buildUrl(endpoint: string, params?: Record<string, string>): string {
  if (!params) return endpoint;
  const query = new URLSearchParams(params).toString();
  return `${endpoint}?${query}`;
}

async function parseErrorMessageFromJson(response: Response): Promise<string> {
  const errorData = (await response.json().catch(() => ({}))) as ApiErrorBody;
  return errorData.mensagem || errorData.erro || `Erro na requisição: ${response.status}`;
}

async function handleUnauthorized<T>(url: string, response: Response): Promise<T> {
  if (url.includes('/auth/login')) {
    const errorData = (await response.json().catch(() => ({}))) as ApiErrorBody;
    const msg = errorData.mensagem || errorData.erro || 'Credenciais inválidas.';
    throw new Error(msg);
  }
  const { store: st } = await import('@/store');
  const { logoutSession, setAuthError } = await import('@/store/slices/authSlice');
  await (st.dispatch as AppDispatch)(logoutSession());
  st.dispatch(setAuthError('Sua sessão expirou ou é inválida. Por favor, faça login novamente.'));
  throw new Error('Sessão expirada');
}

function unwrapEnvelope<T>(resposta: unknown): T {
  if (
    resposta &&
    typeof resposta === 'object' &&
    'sucesso' in resposta &&
    'dados' in resposta &&
    (resposta as { sucesso: boolean }).sucesso === true
  ) {
    return (resposta as { dados: T }).dados;
  }
  return resposta as T;
}

async function parseJsonBody<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return {} as T;
  }
  const resposta = await response.json();
  return unwrapEnvelope<T>(resposta);
}

async function responseToResult<T>(url: string, response: Response): Promise<T> {
  if (response.status === 401) {
    return handleUnauthorized<T>(url, response);
  }
  if (response.status === 403) {
    throw new Error('Você não tem permissão para acessar este recurso.');
  }
  if (!response.ok) {
    const msg = await parseErrorMessageFromJson(response);
    throw new Error(msg);
  }
  return parseJsonBody<T>(response);
}

function rethrowNetworkError(error: unknown): never {
  console.error('[API Error]:', error);
  const err = error as Error;
  if (err?.message === 'Failed to fetch') {
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique se o backend está rodando e tente novamente.',
    );
  }
  throw error;
}

/**
 * Cliente API centralizado para chamadas à API com tratamento de erros.
 * - Cookie HttpOnly (JWT): `credentials: 'include'` na mesma origem (proxy `/api`).
 * - Bearer: apenas quando há token JWT no Redux (ex.: testes).
 * - 401 em rotas autenticadas: encerra sessão (logoutSession). Login com credenciais inválidas não dispara logout global.
 */
export class ApiClient {
  private static async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = buildUrl(endpoint, params);

    const { store } = await import('@/store');
    const state = store.getState() as RootState;
    const token = state.auth.token;

    const headers = new Headers(fetchOptions.headers);
    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (import.meta.env.VITE_USE_TEST_DB === 'true') {
      headers.set('x-use-test-db', 'true');
    }

    if (token && token.split('.').length === 3) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...fetchOptions,
      headers,
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);
      return await responseToResult<T>(url, response);
    } catch (error: unknown) {
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
