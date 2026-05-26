import type { AuthUser } from './authSlice';

export const SESSION_STORAGE_KEY = 'les_auth_session';

interface ISessaoArmazenada {
  user: AuthUser;
  token?: string;
}

export function lerSessaoArmazenada(): ISessaoArmazenada | null {
  if (typeof window === 'undefined') return null;
  const sessaoBruta = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessaoBruta) return null;
  try {
    const sessaoParseada = JSON.parse(sessaoBruta) as { user?: AuthUser; token?: string };
    if (!sessaoParseada.user) return null;
    return { user: sessaoParseada.user, token: sessaoParseada.token };
  } catch {
    return null;
  }
}

export function salvarSessaoArmazenada(user: AuthUser, token?: string | null) {
  const sessaoArmazenada: ISessaoArmazenada = { user, token: token ?? undefined };
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessaoArmazenada));
}

export function limparSessaoArmazenada() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}
