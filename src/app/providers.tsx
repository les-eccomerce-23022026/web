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
  console.log('[SENIOR-DEBUG] Providers Rendering');
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Só usar hooks Redux após montagem no client
  const dispatch = useAppDispatch();
  
  // 🔥 Ativa a validação de sessão em background (Senior UX)
  // Só executa no client side após montagem
  if (isMounted) {
    useActiveSessionValidation();
  }

  useEffect(() => {
    if (!isMounted) return;

    // Restaura a sessão antes de qualquer outra busca para evitar redirect prematuro
    dispatch(restoreSession()).finally(() => {
      dispatch(fetchCarrinho());
      dispatch(fetchCategoriasCatalogo());
      const role = store.getState().auth.user?.role;
      if (role === 'admin') {
        dispatch(fetchAdmins());
      }
    });
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
