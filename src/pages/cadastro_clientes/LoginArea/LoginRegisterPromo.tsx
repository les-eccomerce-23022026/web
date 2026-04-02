import styles from './LoginArea.module.css';
import type { LoginAreaRegisterState } from './loginAreaTypes';

type Props = {
  registerState: LoginAreaRegisterState;
};

export const LoginRegisterPromo = ({ registerState }: Props) => (
  <>
    <h2 className={styles['register-title']}>Quero me Cadastrar</h2>
    <p className={styles['register-text']}>
      Crie sua conta na LES Livraria para acessar promoções exclusivas, histórico de compras, troca de
      livros fácil e um checkout mais rápido para suas próximas leituras.
    </p>
    {registerState.regSuccess && (
      <p className={styles['auth-message-success']}>{registerState.regSuccess}</p>
    )}
    <button
      className={`btn-secondary ${styles['login-btn-register']}`}
      onClick={() => registerState.setShowRegister(true)}
      data-cy="register-toggle-button"
    >
      Criar Nova Conta
    </button>
  </>
);
