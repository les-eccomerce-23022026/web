import './LoginArea.css';

export function LoginArea() {
  return (
    <div className="auth-page">
      <div className="login-box card login-box-card">
        <h2 className="login-title">Já sou Cliente</h2>
        <div className="form-group">
          <label>E-mail ou CPF</label>
          <input type="text" placeholder="joao@email.com" />
        </div>
        <div className="form-group">
          <label>Senha</label>
          <input type="password" placeholder="••••••••" />
          <a href="#" className="login-forgot-password">Esqueci minha senha</a>
        </div>
        <button className="btn-primary login-btn-enter">Entrar</button>
      </div>

      <div className="register-box card register-box-card">
        <h2 className="register-title">Quero me Cadastrar</h2>
        <p className="register-text">Crie sua conta na LES Livraria para acessar promoções exclusivas, histórico de compras, troca de livros fácil e um checkout mais rápido para suas próximas leituras.</p>
        <button className="btn-secondary login-btn-register">Criar Nova Conta</button>
      </div>
    </div>
  );
}
