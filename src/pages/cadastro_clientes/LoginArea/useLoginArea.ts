import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess } from '@/store/slices/authSlice';
import { AuthService } from '@/services/AuthService';

export function useLoginArea() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loginError, setLoginError] = useState('');

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
    if (!email || !senha) return;

    setLoginError('');

    try {
      const data = await AuthService.login({ email, senha });
      dispatch(loginSuccess({ token: data.token, user: data.user }));

      if (data.user.role === 'admin') {
        navigate('/admin');
        return;
      }
      navigate('/');
    } catch (err) {
      setLoginError('E-mail ou senha inválidos. Verifique suas credenciais.');
      console.error('[Auth] Falha no login:', err);
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
      await AuthService.registrarCliente({
        nome: regNome,
        cpf: regCpf,
        email: regEmail,
        senha: regSenha,
        confirmacao_senha: regConfirmaSenha,
      });

      setRegSuccess('Cadastro realizado com sucesso.');
      setShowRegister(false);
    } catch (err) {
      setRegError('Erro ao registrar. Tente novamente.');
      console.error('[Auth] Falha no registro:', err);
    }
  };

  return {
    loginState: { email, setEmail, senha, setSenha, handleLogin, loginError },
    registerState: {
      showRegister, setShowRegister,
      regNome, setRegNome,
      regCpf, setRegCpf,
      regEmail, setRegEmail,
      regSenha, setRegSenha,
      regConfirmaSenha, setRegConfirmaSenha,
      regError, regSuccess, handleRegister,
    },
  };
}
