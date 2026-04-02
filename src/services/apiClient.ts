import type { RootState } from '@/store';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Cliente API centralizado para chamadas à API com tratamento de erros.
 * Segue boas práticas de segurança:
 * - Adiciona token JWT do Redux state se presente (para MOCK ou session storage seguro em memória).
 * - Trata 401 (Não Autorizado) e 403 (Proibido) expirando a sessão.
 * - Limita vazamento de informações em erros.
 */
export class ApiClient {
  private static async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    
    // Constrói URL com query parameters se houver
    let url = endpoint;
    if (params) {
      const query = new URLSearchParams(params).toString();
      url = `${endpoint}?${query}`;
    }

    // Pega o token atual do Redux Store
    const { store } = await import('@/store');
    const state = store.getState() as RootState;
    const token = state.auth.token;

    // Configuração de headers padrão
    const headers = new Headers(fetchOptions.headers);
    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    // Injeta o header para usar o banco de testes se a variável de ambiente estiver ativa
    if (import.meta.env.VITE_USE_TEST_DB === 'true') {
      headers.set('x-use-test-db', 'true');
    }

    // Adiciona o token se disponível (Uso de 'Authorization' header)
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...fetchOptions,
      headers,
      // Se estivermos usando cookies HttpOnly, precisamos de credentials: 'include'
      // mas como o usuário pediu pra "guardar o token", lidamos com o portador (Bearer) explicitamente
      credentials: 'include', 
    };

    try {
      const response = await fetch(url, config);

      // Tratamento de segurança para sessões expiradas ou inválidas
      if (response.status === 401 || response.status === 403) {
        // Se for a verificação de sessão (/auth/me), não desloga automaticamente
        // para permitir que o AuthService tente o fallback do sessionStorage.
        if (url.includes('/auth/me')) {
          throw new Error('Sessão inválida ou expirada');
        }

        // Se for 403 (Proibido), o usuário está autenticado mas não tem permissão.
        // Não devemos deslogar, apenas lançar o erro para o componente tratar (ex: redirecionar p/ home).
        if (response.status === 403) {
          throw new Error('Você não tem permissão para acessar este recurso.');
        }

        const { store } = await import('@/store');
        const { logout, setAuthError } = await import('@/store/slices/authSlice');
        store.dispatch(logout());
        store.dispatch(setAuthError('Sua sessão expirou ou é inválida. Por favor, faça login novamente.'));
        throw new Error('Sessão expirada');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as {
          mensagem?: string;
          erro?: string;
        };
        const msg =
          errorData.mensagem ||
          errorData.erro ||
          `Erro na requisição: ${response.status}`;
        throw new Error(msg);
      }

      // Evita tentar parsear JSON em respostas vazias (204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      const resposta = await response.json();

      // Desempacota automaticamente o formato padrão { sucesso: true, dados: T }
      if (
        resposta &&
        typeof resposta === 'object' &&
        'sucesso' in resposta &&
        'dados' in resposta &&
        resposta.sucesso === true
      ) {
        return resposta.dados as T;
      }

      return resposta as T;
    } catch (error: unknown) {
      console.error('[API Error]:', error);
      const err = error as Error;
      if (err?.message === 'Failed to fetch') {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando e tente novamente.');
      }
      throw error;
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
