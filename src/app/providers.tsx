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

  // Só usar hooks Redux após montagem no client
  const dispatch = useAppDispatch();
  
  // 🔥 Ativa a validação de sessão em background (Senior UX)
  // O hook já tem sua própria lógica para não executar quando não está autenticado
  useActiveSessionValidation();

  useEffect(() => {
    if (!isMounted) return;

    // Restaura a sessão antes de qualquer outra busca para evitar redirect prematuro
    const inicializarAplicacao = async () => {
      try {
        await dispatch(restoreSession()).unwrap();
        // Só executa ações dependentes após restoreSession ter sucesso
        dispatch(fetchCarrinho());
        dispatch(fetchCategoriasCatalogo());
        const role = store.getState().auth.user?.role;
        if (role === 'admin') {
          dispatch(fetchAdmins());
        }
      } catch (_erro) {
        console.error('Erro ao inicializar aplicação:', _erro);
      }
    };

    void inicializarAplicacao();
  }, [dispatch, isMounted]);

  return (
    <ErrorBoundary>
      <NotificationProvider>
        {children}
        <NotificationContainer />
      </NotificationProvider>
    </ErrorBoundary>
  );
};

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReduxProvider store={store}>
      <ProvidersContent>{children}</ProvidersContent>
    </ReduxProvider>
  );
};

export { Providers };
