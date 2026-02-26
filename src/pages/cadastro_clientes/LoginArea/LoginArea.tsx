import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess } from '@/store/slices/authSlice';
import './LoginArea.css';

export function LoginArea() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  const [showRegister, setShowRegister] = useState(false);
  const [regNome, setRegNome] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSenha, setRegSenha] = useState('');
  const [regConfirmaSenha, setRegConfirmaSenha] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (email && senha) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
        });
        if (response.ok) {
          const data = await response.json();
          dispatch(loginSuccess({ token: data.token, user: data.user }));
          if (data.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
      } catch (err) {
        console.error('Login mock não respondeu, ignorar no cypress mas ideal ter catch', err);
      }
    }
  };

  const regexSenhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;

  const handleRegister = async () => {
    setRegError('');
    setRegSuccess('');

    if (!regexSenhaForte.test(regSenha)) {
      setRegError('A senha deve conter pelo menos 8 caracteres, maiúsculas, minúsculas e especiais');
      return;
    }

    if (regSenha !== regConfirmaSenha) {
      setRegError('As senhas não coincidem');
      return;
    }

    try {
      const payload = {
        nome: regNome,
        cpf: regCpf,
        email: regEmail,
        senha: regSenha,
        confirmacao_senha: regConfirmaSenha,
        // SEM ROLE AQUI
      };
      const response = await fetch('/api/clientes/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setRegSuccess('Cadastro realizado com sucesso.');
        setShowRegister(false); // Voltar pro login
      }
    } catch (err) {
      setRegError('Erro ao registrar.');
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
        {!showRegister ? (
          <>
            <h2 className="register-title">Quero me Cadastrar</h2>
            <p className="register-text">Crie sua conta na LES Livraria para acessar promoções exclusivas, histórico de compras, troca de livros fácil e um checkout mais rápido para suas próximas leituras.</p>
            {regSuccess && <p className="auth-message-success">{regSuccess}</p>}
            <button className="btn-secondary login-btn-register" onClick={() => setShowRegister(true)}>Criar Nova Conta</button>
          </>
        ) : (
          <>
            <h2 className="register-title">Criar Conta</h2>
            {regError && <p className="auth-message-error">{regError}</p>}
            <div className="form-group">
              <label>Nome</label>
              <input type="text" name="nome" value={regNome} onChange={(e) => setRegNome(e.target.value)} />
            </div>
            <div className="form-group">
              <label>CPF</label>
              <input type="text" name="cpf" value={regCpf} onChange={(e) => setRegCpf(e.target.value)} />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input type="text" name="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input type="password" name="senha" value={regSenha} onChange={(e) => setRegSenha(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Confirmar Senha</label>
              <input type="password" name="confirmacao_senha" value={regConfirmaSenha} onChange={(e) => setRegConfirmaSenha(e.target.value)} />
            </div>
            <div className="auth-form-actions">
              <button className="btn-primary login-btn-register" onClick={handleRegister}>Finalizar Cadastro</button>
              <button className="btn-secondary login-btn-register" onClick={() => setShowRegister(false)}>Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
