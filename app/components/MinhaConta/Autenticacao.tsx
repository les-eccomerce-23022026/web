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
        <button
          data-cy="auth-show-register"
          className="btn-secondary"
          onClick={() => registerState.setShowRegister(true)}
          style={{ marginTop: '1rem' }}
        >
          Criar Conta
        </button>
      </div>

      <div className={`card ${styles.registerBoxCard}`}>
        {registerState.regSuccess && (
          <p className={styles['auth-message-success']}>{registerState.regSuccess}</p>
        )}
        {registerState.showRegister && (
          <>
            <AutenticacaoClienteWizardCadastro registerState={registerState} dominios={dominios} />
            <button
              data-cy="auth-hide-register"
              className="btn-secondary"
              onClick={() => registerState.setShowRegister(false)}
              style={{ marginTop: '1rem' }}
            >
              Voltar para Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
