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

      const raw = await response.json();
      const { unwrapEnvelope } = await import('./httpUtils');
      const data = unwrapEnvelope<{ token?: string; user: unknown }>(raw);

      // Atualizar Redux com novo usuário apenas quando o servidor retornou dados válidos
      if (data.user) {
        const { store: st } = await import('../store/index');
        const { loginSuccess } = await import('../store/slices/authSlice');
        (st.dispatch as AppDispatch)(
          loginSuccess({
            token: data.token,
            user: data.user as import('../store/slices/authSlice').AuthUser,
          }),
        );
      }

      return { token: data.token ?? '', user: data.user };
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function handleUnauthorized<T>(url: string, response: Response, originalRequest?: Request): Promise<T> {
  console.warn('[SENIOR-DEBUG] ApiClient - 401 Unauthorized detected', { url });

  // Rotas em que 401 é esperado (sem sessão) — não dispara logout global
  if (
    url.includes('/auth/login') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/me')
  ) {
    const errorData = (await response.json().catch(() => ({}))) as ApiErrorBody;
    const msg = errorData.mensagem || errorData.erro || 'Credenciais inválidas.';
    throw new Error(msg);
  }

  // Tentar renovar token e repetir a requisição original
  try {
    await tentarRenovarToken();

    if (!originalRequest) {
      throw new Error('Requisição original não disponível para retry');
    }

    const retryResponse = await fetch(originalRequest.clone(), {
      credentials: 'include',
    });

    if (!retryResponse.ok) {
      throw new Error('Falha ao repetir requisição após refresh');
    }

    const { parseJsonBody } = await import('./httpUtils');
    return parseJsonBody<T>(retryResponse);
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
