import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, setAuthError } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AuthService } from '@/services/AuthService';
import { ClienteService } from '@/services/ClienteService';
import clientesMock from '@/mocks/clientesMock.json';
import type { Genero, ITelefone } from '@/interfaces/ICliente';
import type { IEnderecoCliente } from '@/interfaces/IPagamento';

const REGEX_SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
const REGEX_CPF_COM_MASCARA = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const REGEX_CPF_SEM_MASCARA = /^\d{11}$/;

const ENDERECO_VAZIO: Omit<IEnderecoCliente, 'uuid'> = {
  apelido: '',
  tipoResidencia: 'Casa',
  tipoLogradouro: 'Rua',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cep: '',
  cidade: '',
  estado: '',
  pais: 'Brasil',
};

const TELEFONE_VAZIO: ITelefone = {
  tipo: 'Celular',
  ddd: '',
  numero: '',
};

export function useLoginArea() {
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
  const tiposResidencia = clientesMock.tiposResidencia;
  const tiposLogradouro = clientesMock.tiposLogradouro;

  // --- Login ---
  const handleLogin = async () => {
    if (!email || !senha) return;

    setLoginError('');
    dispatch(setAuthError(null));

    try {
      const data = await AuthService.login({ email: email.trim(), senha });
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

  // --- Register Step 1 Validation ---
  const validateStep1 = (): boolean => {
    setRegError('');

    if (!regNome.trim()) {
      setRegError('Nome é obrigatório.');
      return false;
    }

    const cpfLimpo = regCpf.trim();
    const isFormatOk =
      REGEX_CPF_COM_MASCARA.test(cpfLimpo) ||
      REGEX_CPF_SEM_MASCARA.test(cpfLimpo);

    if (!isFormatOk) {
      setRegError('CPF inválido. Use 000.000.000-00 ou apenas 11 números.');
      return false;
    }

    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Informe um e-mail válido.');
      return false;
    }

    if (!REGEX_SENHA_FORTE.test(regSenha)) {
      setRegError(
        'A senha deve conter pelo menos 8 caracteres, maiúsculas, minúsculas, números e especiais.',
      );
      return false;
    }

    if (regSenha !== regConfirmaSenha) {
      setRegError('As senhas não coincidem.');
      return false;
    }

    if (!regDataNascimento) {
      setRegError('Data de nascimento é obrigatória.');
      return false;
    }

    if (!regTelefone.ddd || !regTelefone.numero) {
      setRegError('Telefone (DDD e Número) é obrigatório.');
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

  // --- Register Step 2 Validation ---
  const validateEndereco = (
    endereco: Omit<IEnderecoCliente, 'uuid'>,
    label: string,
  ): boolean => {
    if (!endereco.logradouro.trim()) {
      setRegError(`${label}: Logradouro é obrigatório.`);
      return false;
    }
    if (!endereco.numero.trim()) {
      setRegError(`${label}: Número é obrigatório.`);
      return false;
    }
    if (!endereco.bairro.trim()) {
      setRegError(`${label}: Bairro é obrigatório.`);
      return false;
    }
    if (!endereco.cep.trim()) {
      setRegError(`${label}: CEP é obrigatório.`);
      return false;
    }
    if (!endereco.cidade.trim()) {
      setRegError(`${label}: Cidade é obrigatório.`);
      return false;
    }
    if (!endereco.estado.trim()) {
      setRegError(`${label}: Estado é obrigatório.`);
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
      tiposResidencia,
      tiposLogradouro,
    },
  };
}
