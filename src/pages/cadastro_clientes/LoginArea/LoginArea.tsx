import { useLoginArea } from './useLoginArea';
import styles from './LoginArea.module.css';

export function LoginArea() {
  const { loginState, registerState } = useLoginArea();

  return (
    <div className={styles['auth-page']}>
      <div className={`login-box card ${styles['login-box-card']}`}>
        <h2 className={styles['login-title']}>Já sou Cliente</h2>
        <div className="form-group">
          <label>E-mail ou CPF</label>
          <input 
            type="text" 
            placeholder="joao@email.com" 
            value={loginState.email}
            onChange={(e) => loginState.setEmail(e.target.value)}
            data-cy="login-email-input"
          />
        </div>
        <div className="form-group">
          <label>Senha</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={loginState.senha}
            onChange={(e) => loginState.setSenha(e.target.value)}
            data-cy="login-password-input"
          />
          <a href="#" className={styles['login-forgot-password']}>Esqueci minha senha</a>
        </div>
        <button onClick={loginState.handleLogin} className={`btn-primary ${styles['login-btn-enter']}`} data-cy="login-submit-button">Entrar</button>
      </div>

      <div className={`register-box card ${styles['register-box-card']}`}>
        {!registerState.showRegister ? (
          <>
            <h2 className={styles['register-title']}>Quero me Cadastrar</h2>
            <p className={styles['register-text']}>Crie sua conta na LES Livraria para acessar promoções exclusivas, histórico de compras, troca de livros fácil e um checkout mais rápido para suas próximas leituras.</p>
            {registerState.regSuccess && <p className={styles['auth-message-success']}>{registerState.regSuccess}</p>}
            <button className={`btn-secondary ${styles['login-btn-register']}`} onClick={() => registerState.setShowRegister(true)} data-cy="register-toggle-button">Criar Nova Conta</button>
          </>
        ) : (
          <>
            <h2 className={styles['register-title']}>Criar Conta</h2>
            {registerState.regError && <p className={styles['auth-message-error']}>{registerState.regError}</p>}
            <div className="form-group">
              <label>Nome</label>
              <input type="text" name="nome" value={registerState.regNome} onChange={(e) => registerState.setRegNome(e.target.value)} data-cy="register-nome-input" />
            </div>
            <div className="form-group">
              <label>CPF</label>
              <input type="text" name="cpf" value={registerState.regCpf} onChange={(e) => registerState.setRegCpf(e.target.value)} data-cy="register-cpf-input" />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input type="text" name="email" value={registerState.regEmail} onChange={(e) => registerState.setRegEmail(e.target.value)} data-cy="register-email-input" />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input type="password" name="senha" value={registerState.regSenha} onChange={(e) => registerState.setRegSenha(e.target.value)} data-cy="register-senha-input" />
            </div>
            <div className="form-group">
              <label>Confirmar Senha</label>
              <input type="password" name="confirmacao_senha" value={registerState.regConfirmaSenha} onChange={(e) => registerState.setRegConfirmaSenha(e.target.value)} data-cy="register-confirmacao-senha-input" />
            </div>
            <div className={styles['auth-form-actions']}>
              <button className={`btn-primary ${styles['login-btn-register']}`} onClick={registerState.handleRegister} data-cy="register-submit-button">Finalizar Cadastro</button>
              <button className={`btn-secondary ${styles['login-btn-register']}`} onClick={() => registerState.setShowRegister(false)}>Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
