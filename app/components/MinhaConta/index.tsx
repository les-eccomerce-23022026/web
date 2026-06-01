'use client';

import { useAppSelector } from '@/store/hooks';
import MeuPerfil from '@/pages-react-router/CadastroClientes/MeuPerfil';
import { Autenticacao } from './Autenticacao';

export const MinhaConta = () => {
  const { isAuthenticated, sessionLoading } = useAppSelector((state) => state.auth);

  if (sessionLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>;
  }

  if (isAuthenticated) {
    return <MeuPerfil />;
  }

  return <Autenticacao />;
};
