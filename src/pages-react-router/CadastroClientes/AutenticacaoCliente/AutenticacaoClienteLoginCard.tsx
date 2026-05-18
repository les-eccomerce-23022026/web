import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './style.module.css';
import type { AutenticacaoClienteLoginState } from './autenticacaoClienteTypes';

type Props = {
  loginState: AutenticacaoClienteLoginState;
};

export const AutenticacaoClienteLoginCard = ({ loginState }: Props) => {
  const [emailError, setEmailError] = useState('');
  const [senhaError, setSenhaError] = useState('');

  const validarEmail = (valor: string) => {
    if (!valor.trim()) {
      setEmailError('E-mail é obrigatório.');
      return;
    }
    if (!valor.includes('@')) {
      setEmailError('Informe um e-mail válido.');
      return;
    }
    setEmailError('');
  };

  const validarSenha = (valor: string) => {
    if (!valor.trim()) {
      setSenhaError('Senha é obrigatória.');
      return;
    }
    setSenhaError('');
  };

  return (
    <div className={`card ${styles['login-box-card']}`} data-cy="login-form">
      <h2 className={styles['login-title']}>Já sou Cliente</h2>
      <div className="form-group">
        <label>E-mail ou CPF *</label>
        <input
          type="text"
          placeholder="admin@livraria.com.br (admin)"
          value={loginState.email}
          onChange={(e) => {
            loginState.setEmail(e.target.value);
            if (emailError) setEmailError('');
          }}
          onBlur={() => validarEmail(loginState.email)}
          className={`${styles.passwordInput} ${emailError ? styles['input-error'] : ''}`}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? 'email-error-message' : undefined}
          data-cy="login-email-input"
        />
        {emailError && (
          <p className={styles['auth-message-error']} id="email-error-message" style={{ marginTop: '4px', fontSize: '12px' }}>
            {emailError}
          </p>
        )}
      </div>
      <div className="form-group">
        <label>Senha *</label>
        <div className={styles.passwordWrapper}>
          <input
            type={loginState.showPasswordLogin ? 'text' : 'password'}
            placeholder="password123"
            className={`${styles.passwordInput} ${senhaError ? styles['input-error'] : ''}`}
            value={loginState.senha}
            onChange={(e) => {
              loginState.setSenha(e.target.value);
              if (senhaError) setSenhaError('');
            }}
            onBlur={() => validarSenha(loginState.senha)}
            aria-invalid={!!senhaError}
            aria-describedby={senhaError ? 'senha-error-message' : undefined}
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
        {senhaError && (
          <p className={styles['auth-message-error']} id="senha-error-message" style={{ marginTop: '4px', fontSize: '12px' }}>
            {senhaError}
          </p>
        )}
        <a href="#" className={styles['login-forgot-password']}>
          Esqueci minha senha
        </a>
      </div>
      {loginState.loginError && (
        <p className={styles['auth-message-error']} id="login-error-message" data-cy="login-error-message">
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
};
