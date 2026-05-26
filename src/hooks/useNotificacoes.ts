/**
 * Hook useNotificacoes
 * 
 * Gerencia o polling de notificações para o usuário autenticado.
 * Faz polling a cada 30 segundos para buscar notificações não lidas.
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { contarNaoLidas, buscarNotificacoes } from '@/store/slices/notificacoesSlice';

const POLLING_INTERVAL_MS = 30000; // 30 segundos

export function useNotificacoes() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { quantidadeNaoLidas, notificacoes } = useAppSelector((state) => state.notificacoes);

  const buscarQuantidadeNaoLidas = useCallback(() => {
    if (isAuthenticated) {
      dispatch(contarNaoLidas());
    }
  }, [dispatch, isAuthenticated]);

  const buscarTodasNotificacoes = useCallback(() => {
    if (isAuthenticated) {
      dispatch(buscarNotificacoes(false));
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') {
      return;
    }

    // Buscar imediatamente ao montar
    buscarQuantidadeNaoLidas();

    // Configurar polling
    const interval = setInterval(() => {
      buscarQuantidadeNaoLidas();
    }, POLLING_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, buscarQuantidadeNaoLidas]);

  return {
    quantidadeNaoLidas,
    notificacoes,
    buscarQuantidadeNaoLidas,
    buscarTodasNotificacoes,
  };
}
