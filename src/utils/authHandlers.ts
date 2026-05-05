import type { AppDispatch } from '../store/index';

type ApiErrorBody = {
  mensagem?: string;
  erro?: string;
};

async function handleUnauthorized<T>(url: string, response: Response): Promise<T> {
  console.warn('[SENIOR-DEBUG] ApiClient - 401 Unauthorized detected', { url });
  if (url.includes('/auth/login')) {
    const errorData = (await response.json().catch(() => ({}))) as ApiErrorBody;
    const msg = errorData.mensagem || errorData.erro || 'Credenciais inválidas.';
    throw new Error(msg);
  }
  const { store: st } = await import('../store/index');
  const { logoutSession, setAuthError } = await import('../store/slices/authSlice');
  await (st.dispatch as AppDispatch)(logoutSession());
  st.dispatch(setAuthError('Sua sessão expirou ou é inválida. Por favor, faça login novamente.'));
  throw new Error('Sessão expirada');
}

export { handleUnauthorized };
