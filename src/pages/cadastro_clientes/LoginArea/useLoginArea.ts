import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess } from '@/store/slices/authSlice';

export function useLoginArea() {
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
    if (!email || !senha) return; // Early return
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      
      if (!response.ok) return;

      const data = await response.json();
      dispatch(loginSuccess({ token: data.token, user: data.user }));
      
      if (data.user.role === 'admin') {
        navigate('/admin');
        return; // Early return for admin
      }
      navigate('/');
    } catch (err) {
      console.error('Login mock não respondeu, ignorar no cypress mas ideal ter catch', err);
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
      };
      const response = await fetch('/api/clientes/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setRegSuccess('Cadastro realizado com sucesso.');
        setShowRegister(false);
      }
    } catch (err) {
      setRegError('Erro ao registrar.');
    }
  };

  return {
    loginState: { email, setEmail, senha, setSenha, handleLogin },
    registerState: { 
      showRegister, setShowRegister,
      regNome, setRegNome,
      regCpf, setRegCpf,
      regEmail, setRegEmail,
      regSenha, setRegSenha,
      regConfirmaSenha, setRegConfirmaSenha,
      regError, regSuccess, handleRegister
    }
  };
}
