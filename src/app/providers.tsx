'use client';

import { useEffect, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppDispatch } from '../store/hooks';
import { store } from '../store';
import { fetchCarrinho } from '../store/slices/carrinhoSlice';
import { fetchCategoriasCatalogo } from '../store/slices/livroSlice';
import { restoreSession } from '../store/slices/authSlice';
import { ErrorBoundary } from '../components/Comum/ErrorBoundary/ErrorBoundary.tsx';
import { NotificationProvider, NotificationContainer } from '../components/Comum/Notification';
import { useActiveSessionValidation } from '../hooks/useActiveSessionValidation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Componente que contém os hooks Redux - só renderiza no client
const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  
  // 🔥 Ativa a validação de sessão em background (Senior UX)
  useActiveSessionValidation();

  useEffect(() => {
    // Restaura a sessão antes de qualquer outra busca para evitar redirect prematuro
    const inicializarAplicacao = async () => {
      try {
        await dispatch(restoreSession()).unwrap();
        // Só executa ações dependentes após restoreSession ter sucesso
        dispatch(fetchCarrinho());
        dispatch(fetchCategoriasCatalogo());
        // Não carregar admins automaticamente - apenas admin_sistema pode listar
        // e isso deve ser feito sob demanda na página específica
      } catch (_erro) {
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
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>
        <ProvidersContent>{children}</ProvidersContent>
      </ReduxProvider>
    </QueryClientProvider>
  );
};

export { Providers };
