import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginSuccess, setAuthError } from '../../../store/slices/authSlice';
import { fetchCarrinho } from '../../../store/slices/carrinhoSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { AuthService } from '../../../services/authService';
import { USE_MOCK } from '../../../config/apiConfig';
import { ClienteService } from '../../../services/clienteService';
import clientesMock from '../../../mocks/clientesMock.json';
import type { Genero, ITelefone } from '../../../interfaces/cliente';
import type { IEnderecoCliente } from '../../../interfaces/pagamento';
import { mensagemErroCadastroStep1 } from './autenticacaoClienteValidacao';
import { ROTAS } from '@/config/rotas';

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
  const [regQuerSerAdmin, setRegQuerSerAdmin] = useState(false);
  const [regTipoPessoaLoja, setRegTipoPessoaLoja] = useState<'PF' | 'PJ'>('PJ');
  const [regCnpjLoja, setRegCnpjLoja] = useState('');
  const [regNomeFantasiaLoja, setRegNomeFantasiaLoja] = useState('');
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
  const router = useRouter();
  const { authError } = useAppSelector((state) => state.auth);

  // --- Domínios do mock ---
  const generosDisponiveis = clientesMock.generosDisponiveis;
  const tiposTelefone = clientesMock.tiposTelefone;

  // --- Login ---
  const handleLogin = async () => {
    console.log('[Auth] Iniciando login');
    console.log('[Auth] Email:', email);
    console.log('[Auth] Senha preenchida:', !!senha);

    if (!email || !senha) {
      console.log('[Auth] Login cancelado: campos vazios');
      return;
    }

    setLoginError('');
    dispatch(setAuthError(null));

    try {
      console.log('[Auth] Chamando AuthService.login...');
      const data = await AuthService.login({ email: email.trim(), senha });
      console.log('[Auth] Login bem-sucedido:', data);

      // #region agent log
      fetch('http://127.0.0.1:7252/ingest/8c947da7-7023-400a-ab71-9b9c5909fd2b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8ec46' },
        body: JSON.stringify({
          sessionId: 'a8ec46',
          runId: 'pre-fix',
          hypothesisId: 'E',
          location: 'useAutenticacaoCliente.ts:login-success',
          message: 'AuthService.login succeeded',
          data: {
            userRole: data.user?.role ?? null,
            hasToken: !!data.token,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      dispatch(
        loginSuccess({
          user: data.user,
          token: USE_MOCK ? data.token : undefined,
        }),
      );
      console.log('[Auth] Dispatch loginSuccess executado');

      void dispatch(fetchCarrinho());
      console.log('[Auth] Dispatch fetchCarrinho executado');

      // Redireciona para admin se tiver papel de admin ou admin_sistema
      if (data.user.papeis?.includes('admin') || data.user.papeis?.includes('admin_sistema')) {
        console.log('[Auth] Redirecionando para /admin');
        router.push(ROTAS.ADMIN.HOME);
        return;
      }
      console.log('[Auth] Redirecionando para /');
      router.push(ROTAS.HOME);
      // #region agent log
      fetch('http://127.0.0.1:7252/ingest/8c947da7-7023-400a-ab71-9b9c5909fd2b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8ec46' },
        body: JSON.stringify({
          sessionId: 'a8ec46',
          runId: 'pre-fix',
          hypothesisId: 'E',
          location: 'useAutenticacaoCliente.ts:redirect-home',
          message: 'router.push(/) called after login',
          data: { target: '/' },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7252/ingest/8c947da7-7023-400a-ab71-9b9c5909fd2b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8ec46' },
        body: JSON.stringify({
          sessionId: 'a8ec46',
          runId: 'pre-fix',
          hypothesisId: 'E',
          location: 'useAutenticacaoCliente.ts:login-error',
          message: 'AuthService.login failed',
          data: { errorType: err instanceof Error ? err.name : typeof err },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      console.error('[Auth] Falha no login:', err);
      setLoginError('E-mail ou senha inválidos. Verifique suas credenciais.');
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
    setRegError('');
    if (regStep === 1) {
      if (!validateStep1()) return;
      setRegStep(2);
    } else if (regStep === 2 && regQuerSerAdmin) {
      setRegStep(3);
    }
  };

  const handlePrevStep = () => {
    setRegError('');
    if (regStep === 2) {
      setRegStep(1);
    } else if (regStep === 3) {
      setRegStep(2);
    }
  };

  // --- Register Submit ---
  const handleRegister = async () => {
    setRegError('');
    setRegSuccess('');

    // #region agent log
    fetch('http://127.0.0.1:7252/ingest/8c947da7-7023-400a-ab71-9b9c5909fd2b', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'cfd192' },
      body: JSON.stringify({
        sessionId: 'cfd192',
        runId: 'pre-fix',
        hypothesisId: 'H2-H5-H6',
        location: 'useAutenticacaoCliente.ts:handleRegister-entry',
        message: 'handleRegister called (sem endereço)',
        data: {
          regCpfLen: regCpf.trim().length,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

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
        querSerAdmin: regQuerSerAdmin,
        nomeFantasiaLoja: regNomeFantasiaLoja,
        tipoPessoaLoja: regTipoPessoaLoja,
        cnpjLoja: regCnpjLoja,
      });

      setRegSuccess(`Bem-vindo, ${regNome}! Cadastro realizado com sucesso.`);
      // Não esconder showRegister para que a mensagem de sucesso seja visível no teste
      // setShowRegister(false);
      setRegStep(1);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao registrar. Tente novamente.';
      // #region agent log
      fetch('http://127.0.0.1:7252/ingest/8c947da7-7023-400a-ab71-9b9c5909fd2b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'cfd192' },
        body: JSON.stringify({
          sessionId: 'cfd192',
          runId: 'pre-fix',
          hypothesisId: 'H5-H6',
          location: 'useAutenticacaoCliente.ts:handleRegister-catch',
          message: 'register API failed',
          data: { errorMessage },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
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
      regQuerSerAdmin,
      setRegQuerSerAdmin,
      regTipoPessoaLoja,
      setRegTipoPessoaLoja,
      regCnpjLoja,
      setRegCnpjLoja,
      regNomeFantasiaLoja,
      setRegNomeFantasiaLoja,
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
