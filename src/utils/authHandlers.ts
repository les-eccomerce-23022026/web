import type { AppDispatch } from '../store/index';

type ApiErrorBody = {
  mensagem?: string;
  erro?: string;
};

// Flag para evitar loop infinito de refresh
let refreshPromise: Promise<{ token: string; user: unknown }> | null = null;

/**
 * Tenta renovar o token usando refresh token
 */
async function tentarRenovarToken(): Promise<{ token: string; user: unknown }> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const { API_ENDPOINTS } = await import('../config/apiConfig');
      const response = await fetch(API_ENDPOINTS.refresh, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Falha ao renovar token');
      }

      const data = await response.json();
      
      // Atualizar Redux com novo usuário
      const { store: st } = await import('../store/index');
      const { loginSuccess } = await import('../store/slices/authSlice');
      (st.dispatch as AppDispatch)(
        loginSuccess({
          user: data.user,
        }),
      );

      return { token: data.token, user: data.user };
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function handleUnauthorized<T>(url: string, response: Response): Promise<T> {
  console.warn('[SENIOR-DEBUG] ApiClient - 401 Unauthorized detected', { url });
  
  // Não tentar refresh para rotas de login, logout ou refresh
  if (url.includes('/auth/login') || url.includes('/auth/logout') || url.includes('/auth/refresh')) {
    const errorData = (await response.json().catch(() => ({}))) as ApiErrorBody;
    const msg = errorData.mensagem || errorData.erro || 'Credenciais inválidas.';
    throw new Error(msg);
  }

  // Tentar renovar token
  try {
    await tentarRenovarToken();
    
    // Repetir a requisição original
    const { buildUrl } = await import('./httpUtils');
    const clonedRequest = response.clone();
    const originalUrl = response.url;
    
    const retryResponse = await fetch(originalUrl, {
      method: clonedRequest.method,
      headers: clonedRequest.headers,
      body: clonedRequest.body,
      credentials: 'include',
    });

    if (!retryResponse.ok) {
      throw new Error('Falha ao repetir requisição após refresh');
    }

    const data = await retryResponse.json();
    return data;
  } catch (erro) {
    // Se refresh falhar, fazer logout
    const { store: st } = await import('../store/index');
    const { logoutSession, setAuthError } = await import('../store/slices/authSlice');
    await (st.dispatch as AppDispatch)(logoutSession());
    st.dispatch(setAuthError('Sua sessão expirou ou é inválida. Por favor, faça login novamente.'));
    throw new Error('Sessão expirada');
  }
}

export { handleUnauthorized };
