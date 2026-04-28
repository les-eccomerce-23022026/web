import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { restoreSession } from '@/store/slices/authSlice';

/**
 * Hook Senior de Validação Ativa de Sessão.
 * 
 * Responsável por:
 * 1. Validar a sessão silenciosamente quando o usuário volta para a aba (focus/visibility).
 * 2. Permitir que o app lide com tokens expirados sem travar a UI inicialmente.
 * 3. Integrar com o ApiClient (que já dispara logout no 401).
 */
export const useActiveSessionValidation = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const validate = useCallback(() => {
    if (isAuthenticated) {
      // Faz o ping silencioso ao backend
      void dispatch(restoreSession());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        validate();
      }
    };

    // Valida quando a janela ganha foco
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', validate);

    // Validação periódica a cada 5 minutos (opcional, mas recomendado para segurança)
    const interval = setInterval(validate, 1000 * 60 * 5);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', validate);
      clearInterval(interval);
    };
  }, [isAuthenticated, validate]);

  return { validate };
};
