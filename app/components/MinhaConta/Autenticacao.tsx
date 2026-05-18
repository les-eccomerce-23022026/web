'use client';

import { useAutenticacaoCliente } from '@/pages-react-router/CadastroClientes/AutenticacaoCliente/useAutenticacaoCliente';
import { AutenticacaoClienteLoginCard } from '@/pages-react-router/CadastroClientes/AutenticacaoCliente/AutenticacaoClienteLoginCard';
import { AutenticacaoClienteWizardCadastro } from '@/pages-react-router/CadastroClientes/AutenticacaoCliente/AutenticacaoClienteWizardCadastro';
import styles from './Autenticacao.module.css';

export function Autenticacao() {
  const { loginState, registerState, dominios } = useAutenticacaoCliente();

  return (
    <div className={styles.authPage}>
      <div className={`card ${styles.loginBoxCard}`}>
        <AutenticacaoClienteLoginCard loginState={loginState} />
      </div>

      <div className={`card ${styles.registerBoxCard}`}>
        <AutenticacaoClienteWizardCadastro registerState={registerState} dominios={dominios} />
      </div>
    </div>
  );
}
