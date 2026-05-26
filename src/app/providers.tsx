'use client';

import { useEffect, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { useAppDispatch } from '../store/hooks';
import { store } from '../store';
import { fetchCarrinho } from '../store/slices/carrinhoSlice';
import { fetchCategoriasCatalogo } from '../store/slices/livroSlice';
import { fetchAdmins } from '../store/slices/adminSlice';
import { restoreSession } from '../store/slices/authSlice';
import { ErrorBoundary } from '../components/Comum/ErrorBoundary/ErrorBoundary.tsx';
import { NotificationProvider, NotificationContainer } from '../components/Comum/Notification';
import { useActiveSessionValidation } from '../hooks/useActiveSessionValidation';

// Componente que contém os hooks Redux - só renderiza no client
const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  
  // 🔥 Ativa a validação de sessão em background (Senior UX)
  useActiveSessionValidation();

  useEffect(() => {
    // Restaura a sessão antes de qualquer outra busca para evitar redirect prematuro
    const inicializarAplicacao = async () => {
      try {
        const restored = await dispatch(restoreSession()).unwrap();
        // #region agent log
        fetch('http://127.0.0.1:7252/ingest/8c947da7-7023-400a-ab71-9b9c5909fd2b', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8ec46' },
          body: JSON.stringify({
            sessionId: 'a8ec46',
            runId: 'pre-fix',
            hypothesisId: 'C',
            location: 'providers.tsx:restoreSession-fulfilled',
            message: 'restoreSession succeeded on mount',
            data: {
              hasUser: !!restored?.user,
              userNome: restored?.user?.nome ?? null,
              authAfter: {
                isAuthenticated: store.getState().auth.isAuthenticated,
                userNome: store.getState().auth.user?.nome ?? null,
              },
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        // Só executa ações dependentes após restoreSession ter sucesso
        dispatch(fetchCarrinho());
        dispatch(fetchCategoriasCatalogo());
        const papeis = store.getState().auth.user?.papeis;
        if (papeis?.includes('admin') || papeis?.includes('admin_sistema')) {
          dispatch(fetchAdmins());
        }
      } catch (_erro) {
        // #region agent log
        fetch('http://127.0.0.1:7252/ingest/8c947da7-7023-400a-ab71-9b9c5909fd2b', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8ec46' },
          body: JSON.stringify({
            sessionId: 'a8ec46',
            runId: 'pre-fix',
            hypothesisId: 'C,E',
            location: 'providers.tsx:restoreSession-rejected',
            message: 'restoreSession failed on mount',
            data: {
              authAfter: {
                isAuthenticated: store.getState().auth.isAuthenticated,
                userNome: store.getState().auth.user?.nome ?? null,
                sessionLoading: store.getState().auth.sessionLoading,
              },
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        // Sessão não restaurada - usuário deslogado
      }
    };

    void inicializarAplicacao();
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <NotificationProvider>
        {children}
        <NotificationContainer />
      </NotificationProvider>
    </ErrorBoundary>
  );
};

const ProvidersContent = ({ children }: { children: React.ReactNode }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[SENIOR-DEBUG] Providers Rendering');
  }
  const [isMounted, setIsMounted] = useState(false);
  
  // Sincronização necessária para evitar problemas de hidratação SSR
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Só renderiza o componente com hooks após montagem no client
  if (!isMounted) {
    return (
      <ErrorBoundary>
        <NotificationProvider>
          {children}
          <NotificationContainer />
        </NotificationProvider>
      </ErrorBoundary>
    );
  }

  return <ClientProviders>{children}</ClientProviders>;
};

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReduxProvider store={store}>
      <ProvidersContent>{children}</ProvidersContent>
    </ReduxProvider>
  );
};

export { Providers };
