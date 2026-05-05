import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, setAuthError } from '@/store/slices/authSlice';
import { fetchCarrinho } from '@/store/slices/carrinhoSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AuthService } from '@/services/authService';
import { USE_MOCK } from '@/config/apiConfig';
import { ClienteService } from '@/services/clienteService';
import clientesMock from '@/mocks/clientesMock.json';
import type { Genero, ITelefone } from '@/interfaces/cliente';
import type { IEnderecoCliente } from '@/interfaces/pagamento';
import {
  mensagemErroCadastroStep1,
  mensagemErroEnderecoObrigatorio,
} from './autenticacaoClienteValidacao';

const ENDERECO_VAZIO: Omit<IEnderecoCliente, 'uuid'> = {
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cep: '',
  cidade: '',
  estado: '',
  tipo: 'ambos',
};

const TELEFONE_VAZIO: ITelefone = {
  tipo: 'Celular',
  ddd: '',
  numero: '',
};

export function useAutenticacaoCliente() {
  // --- Login State ---
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [loginError, setLoginError] = useState('');

  // --- Register State ---
  const [showRegister, setShowRegister] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [regNome, setRegNome] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSenha, setRegSenha] = useState('');
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const [regConfirmaSenha, setRegConfirmaSenha] = useState('');
  const [showConfirmPasswordRegister, setShowConfirmPasswordRegister] =
    useState(false);
  const [regGenero, setRegGenero] = useState<Genero>('Masculino');
  const [regDataNascimento, setRegDataNascimento] = useState('');
  const [regTelefone, setRegTelefone] = useState<ITelefone>(TELEFONE_VAZIO);
  const [regEnderecoCobranca, setRegEnderecoCobranca] =
    useState<Omit<IEnderecoCliente, 'uuid'>>(ENDERECO_VAZIO);
  const [regEnderecoEntrega, setRegEnderecoEntrega] =
    useState<Omit<IEnderecoCliente, 'uuid'>>(ENDERECO_VAZIO);
  const [isEnderecoEntregaIgual, setIsEnderecoEntregaIgual] = useState(true);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { authError } = useAppSelector((state) => state.auth);

  // --- Domínios do mock ---
  const generosDisponiveis = clientesMock.generosDisponiveis;
  const tiposTelefone = clientesMock.tiposTelefone;

  // --- Login ---
  const handleLogin = async () => {
    if (!email || !senha) return;

    setLoginError('');
    dispatch(setAuthError(null));

    try {
      const data = await AuthService.login({ email: email.trim(), senha });
      dispatch(
        loginSuccess({
          user: data.user,
          token: USE_MOCK ? data.token : undefined,
        }),
      );
      void dispatch(fetchCarrinho());

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

  const validateStep1 = (): boolean => {
    setRegError('');
    const msg = mensagemErroCadastroStep1({
      regNome,
      regCpf,
      regEmail,
      regSenha,
      regConfirmaSenha,
      regDataNascimento,
      regGenero,
      regTelefone,
    });
    if (msg) {
      setRegError(msg);
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep1()) return;
    setRegStep(2);
  };

  const handlePrevStep = () => {
    setRegError('');
    setRegStep(1);
  };

  const validateEndereco = (
    endereco: Omit<IEnderecoCliente, 'uuid'>,
    label: string,
  ): boolean => {
    const msg = mensagemErroEnderecoObrigatorio(endereco, label);
    if (msg) {
      setRegError(msg);
      return false;
    }
    return true;
  };

  // --- Register Submit ---
  const handleRegister = async () => {
    setRegError('');
    setRegSuccess('');

    if (!validateEndereco(regEnderecoCobranca, 'Endereço de Cobrança')) return;

    if (!isEnderecoEntregaIgual) {
      if (!validateEndereco(regEnderecoEntrega, 'Endereço de Entrega')) return;
    }

    setIsRegistering(true);

    try {
      await ClienteService.registrarClienteCompleto({
        nome: regNome,
        cpf: regCpf,
        email: regEmail,
        senha: regSenha,
        confirmacaoSenha: regConfirmaSenha,
        genero: regGenero,
        dataNascimento: regDataNascimento,
        telefone: regTelefone,
        enderecoCobranca: regEnderecoCobranca,
        enderecoEntrega: isEnderecoEntregaIgual
          ? regEnderecoCobranca
          : regEnderecoEntrega,
        enderecoEntregaIgualCobranca: isEnderecoEntregaIgual,
      });

      setRegSuccess(`Bem-vindo, ${regNome}! Cadastro realizado com sucesso.`);
      setShowRegister(false);
      setRegStep(1);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao registrar. Tente novamente.';
      setRegError(errorMessage);
      console.error('[Auth] Falha no registro:', err);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRegister = () => {
    setShowRegister(false);
    setRegStep(1);
    setRegError('');
  };

  return {
    loginState: {
      email,
      setEmail,
      senha,
      setSenha,
      showPasswordLogin,
      setShowPasswordLogin,
      handleLogin,
      loginError: loginError || authError,
    },
    registerState: {
      showRegister,
      setShowRegister,
      regStep,
      regNome,
      setRegNome,
      regCpf,
      setRegCpf,
      regEmail,
      setRegEmail,
      regSenha,
      setRegSenha,
      showPasswordRegister,
      setShowPasswordRegister,
      regConfirmaSenha,
      setRegConfirmaSenha,
      showConfirmPasswordRegister,
      setShowConfirmPasswordRegister,
      regGenero,
      setRegGenero,
      regDataNascimento,
      setRegDataNascimento,
      regTelefone,
      setRegTelefone,
      regEnderecoCobranca,
      setRegEnderecoCobranca,
      regEnderecoEntrega,
      setRegEnderecoEntrega,
      isEnderecoEntregaIgual,
      setIsEnderecoEntregaIgual,
      regError,
      regSuccess,
      isRegistering,
      handleNextStep,
      handlePrevStep,
      handleRegister,
      handleCancelRegister,
    },
    dominios: {
      generosDisponiveis,
      tiposTelefone,
    },
  };
}
