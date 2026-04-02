import { Eye, EyeOff } from 'lucide-react';
import styles from './LoginArea.module.css';
import type { LoginAreaLoginState } from './loginAreaTypes';

type Props = {
  loginState: LoginAreaLoginState;
};

export const LoginAreaLoginCard = ({ loginState }: Props) => (
  <div className={`card ${styles['login-box-card']}`} data-cy="login-form">
    <h2 className={styles['login-title']}>Já sou Cliente</h2>
    <div className="form-group">
      <label>E-mail ou CPF</label>
      <input
        type="text"
        placeholder="admin@livraria.com.br (admin)"
        value={loginState.email}
        onChange={(e) => loginState.setEmail(e.target.value)}
        data-cy="login-email-input"
      />
    </div>
    <div className="form-group">
      <label>Senha</label>
      <div className={styles.passwordWrapper}>
        <input
          type={loginState.showPasswordLogin ? 'text' : 'password'}
          placeholder="password123"
          className={styles.passwordInput}
          value={loginState.senha}
          onChange={(e) => loginState.setSenha(e.target.value)}
          data-cy="login-password-input"
        />
        <button
          data-cy="login-password-toggle"
          type="button"
          className={styles.passwordToggle}
          onClick={() => loginState.setShowPasswordLogin(!loginState.showPasswordLogin)}
          aria-label={loginState.showPasswordLogin ? 'Esconder senha' : 'Mostrar senha'}
        >
          {loginState.showPasswordLogin ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      <a href="#" className={styles['login-forgot-password']}>
        Esqueci minha senha
      </a>
    </div>
    {loginState.loginError && (
      <p className={styles['auth-message-error']} data-cy="login-error-message">
        {loginState.loginError}
      </p>
    )}
    <button
      onClick={loginState.handleLogin}
      className={`btn-primary ${styles['login-btn-enter']}`}
      data-cy="login-submit-button"
    >
      Entrar
    </button>
  </div>
);
