import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import './LoginArea.css';

export function LoginArea() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email) {
      dispatch(login({ email }));
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <div className="login-box card login-box-card">
        <h2 className="login-title">Já sou Cliente</h2>
        <div className="form-group">
          <label>E-mail ou CPF</label>
          <input 
            type="text" 
            placeholder="joao@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Senha</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <a href="#" className="login-forgot-password">Esqueci minha senha</a>
        </div>
        <button onClick={handleLogin} className="btn-primary login-btn-enter">Entrar</button>
      </div>

      <div className="register-box card register-box-card">
        <h2 className="register-title">Quero me Cadastrar</h2>
        <p className="register-text">Crie sua conta na LES Livraria para acessar promoções exclusivas, histórico de compras, troca de livros fácil e um checkout mais rápido para suas próximas leituras.</p>
        <button className="btn-secondary login-btn-register">Criar Nova Conta</button>
      </div>
    </div>
  );
}
