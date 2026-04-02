import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutSession } from '@/store/slices/authSlice';
import { 
  fetchPerfilCompleto, 
  updatePerfilAction, 
  setEnderecos, 
  setCartoes 
} from '@/store/slices/clienteSlice';
import { ClienteService } from '@/services/ClienteService';
import type { IAtualizarPerfilPayload, Genero } from '@/interfaces/ICliente';
import type { IEnderecoCliente } from '@/interfaces/IPagamento';

export const generosDisponiveis = ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'];
export const tiposTelefone = ['Celular', 'Residencial', 'Comercial'];
export const bandeirasPermitidas = ['Visa', 'Mastercard', 'Elo', 'American Express'];

export function useMeuPerfil() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // --- Estado Global (Redux) ---
  const { user } = useAppSelector((state) => state.auth);
  const { perfil: cliente, isLoading, enderecos, cartoes } = useAppSelector((state) => state.cliente);

  // --- Estado Local para Rascunho de Edição (Formulários) ---
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [secaoAtiva, setSecaoAtiva] = useState<'perfil' | 'enderecos' | 'cartoes' | 'senha' | 'perigo'>('perfil');

  // Perfil (Inputs)
  const [nome, setNome] = useState('');
  const [genero, setGenero] = useState<Genero>('Masculino');
  const [dataNascimento, setDataNascimento] = useState('');
  
  // Novos dados (Update seguro)
  const [visualizacaoEmail, setVisualizacaoEmail] = useState('');
  const [visualizacaoCpf, setVisualizacaoCpf] = useState('');
  const [visualizacaoTelefone, setVisualizacaoTelefone] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoCpf, setNovoCpf] = useState('');
  const [novoTelefoneDdd, setNovoTelefoneDdd] = useState('');
  const [novoTelefoneNumero, setNovoTelefoneNumero] = useState('');
  const [novoTelefoneTipo, setNovoTelefoneTipo] = useState('Celular');
  
  const [senhaConfirmacao, setSenhaConfirmacao] = useState('');
  const [showSenhaConfirmacao, setShowSenhaConfirmacao] = useState(false);
  const [showModalSenha, setShowModalSenha] = useState(false);

  // Senha (Inputs)
  const [senhaAtual, setSenhaAtual] = useState('');
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [confirmaNovaSenha, setConfirmaNovaSenha] = useState('');
  const [showConfirmaNovaSenha, setShowConfirmaNovaSenha] = useState(false);
  const [senhaError, setSenhaError] = useState('');
  const [senhaSuccess, setSenhaSuccess] = useState('');

  // Endereços (Form)
  const [showNovoEndereco, setShowNovoEndereco] = useState(false);
  const [enderecoEditandoUuid, setEnderecoEditandoUuid] = useState<string | null>(null);

  // Loading específico para cartões
  const [isCartaoLoading, setIsCartaoLoading] = useState(false);

  const [novoEndLogradouro, setNovoEndLogradouro] = useState('');
  const [novoEndNumero, setNovoEndNumero] = useState('');
  const [novoEndComplemento, setNovoEndComplemento] = useState('');
  const [novoEndBairro, setNovoEndBairro] = useState('');
  const [novoEndCep, setNovoEndCep] = useState('');
  const [novoEndCidade, setNovoEndCidade] = useState('');
  const [novoEndEstado, setNovoEndEstado] = useState('');

  // Cartões (Form)
  const [cartaoPreferencialUuid, setCartaoPreferencialUuid] = useState<string | null>(null);
  const [showNovoCartao, setShowNovoCartao] = useState(false);
  const [cartaoEditandoUuid, setCartaoEditandoUuid] = useState<string | null>(null);
  const [novoCartaoNumero, setNovoCartaoNumero] = useState('');
  const [novoCartaoNome, setNovoCartaoNome] = useState('');
  const [novoCartaoBandeira, setNovoCartaoBandeira] = useState('Visa');
  const [novoCartaoValidade, setNovoCartaoValidade] = useState('');
  const [novoCartaoCvv, setNovoCartaoCvv] = useState('');
  const [showNovoCartaoCvv, setShowNovoCartaoCvv] = useState(false);

  // Modal genérico
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'medium';
  }>({ title: '', message: '', onConfirm: () => {} });

  const hasInitialized = useRef(false);

  const showMessage = useCallback((msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  }, []);

  // --- Sincronizar Redux -> State Local (Apenas no carregamento) ---
  useEffect(() => {
    if (!user) return;
    dispatch(fetchPerfilCompleto(user.uuid));
  }, [user, dispatch]);

  useEffect(() => {
    if (cliente && !hasInitialized.current) {
      setNome(cliente.nome || '');
      setGenero((cliente.genero as Genero) || 'Masculino');
      setDataNascimento(cliente.dataNascimento || '');
      setVisualizacaoEmail(cliente.emailMascarado || cliente.email || '');
      setVisualizacaoCpf(cliente.cpfMascarado || cliente.cpf || '');
      const telStr = cliente.telefone 
        ? `(${cliente.telefone.ddd}) ${cliente.telefone.numeroMascarado || cliente.telefone.numero}`
        : '';
      setVisualizacaoTelefone(telStr);
      setNovoTelefoneTipo(cliente.telefone?.tipo || 'Celular');
      
      hasInitialized.current = true;
    }
  }, [cliente]);

  useEffect(() => {
    if (cartaoEditandoUuid) {
      const c = cartoes.find((c) => c.uuid === cartaoEditandoUuid);
      if (c) {
        setNovoCartaoNumero(`**** **** **** ${c.ultimosDigitosCartao}`);
        setNovoCartaoNome(c.nomeImpresso);
        setNovoCartaoBandeira(c.bandeira);
        
        // Normalizar validade de ISO (YYYY-MM-DD) para MM/AAAA se necessário
        let validadeExibicao = c.validade;
        if (c.validade && c.validade.includes('-')) {
          const [ano, mes] = c.validade.split('-');
          validadeExibicao = `${mes}/${ano}`;
        }
        setNovoCartaoValidade(validadeExibicao);
        
        setNovoCartaoCvv('');
        setShowNovoCartao(true);
      }
    }
  }, [cartaoEditandoUuid, cartoes]);

  // --- Handlers ---

  const handleUpdateProfile = async () => {
    // Check if user changed the visualizacao fields (and they are not their masked default)
    const emailAualCpfMascarado = cliente?.cpfMascarado || cliente?.cpf || '';
    const emailAualEmailMascarado = cliente?.emailMascarado || cliente?.email || '';
    const emailAualTelMascarado = cliente?.telefone ? `(${cliente.telefone.ddd}) ${cliente.telefone.numeroMascarado || cliente.telefone.numero}` : '';

    const isEmailChanged = visualizacaoEmail.trim() !== '' && visualizacaoEmail !== emailAualEmailMascarado;
    const isCpfChanged = visualizacaoCpf.trim() !== '' && visualizacaoCpf !== emailAualCpfMascarado;
    const isTelChanged = visualizacaoTelefone.trim() !== '' && visualizacaoTelefone !== emailAualTelMascarado;

    // Frontend Validations
    if (isEmailChanged) {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(visualizacaoEmail)) {
        showMessage('Por favor, insira um e-mail válido.', 'error');
        return;
      }
    }

    if (isCpfChanged) {
      const cleanCpf = visualizacaoCpf.replace(/\D/g, '');
      if (cleanCpf.length !== 11) {
        showMessage('O CPF deve ter exatamente 11 números.', 'error');
        return;
      }
    }

    if (isTelChanged) {
      const cleanTel = visualizacaoTelefone.replace(/\D/g, '');
      if (cleanTel.length < 10 || cleanTel.length > 11) {
        showMessage('O Telefone deve ter 10 ou 11 números, contando com o DDD.', 'error');
        return;
      }
    }

    if (isEmailChanged || isCpfChanged || isTelChanged) {
      setShowModalSenha(true);
      return;
    }

    const payload: IAtualizarPerfilPayload = {};
    if (nome !== cliente?.nome) payload.nome = nome;
    if (genero !== cliente?.genero) payload.genero = genero;
    if (dataNascimento !== cliente?.dataNascimento) payload.dataNascimento = dataNascimento;

    if (Object.keys(payload).length === 0) {
      showMessage('Nenhuma alteração detectada.', 'success');
      return;
    }

    try {
      await dispatch(updatePerfilAction(payload)).unwrap();
      showMessage('Dados atualizados com sucesso!', 'success');
      hasInitialized.current = false; // Permite re-sincronizar se necessário
    } catch (err: unknown) {
      const error = err as Error;
      const errorMsg = typeof err === 'string' ? err : error.message || 'Erro ao atualizar dados.';
      showMessage(errorMsg, 'error');
    }
  };

  const confirmarUpdateComSenha = async () => {
    const payload: IAtualizarPerfilPayload = { senhaConfirmacao };

    if (nome && nome !== cliente?.nome) payload.nome = nome;
    if (genero && genero !== cliente?.genero) payload.genero = genero as Genero;
    if (dataNascimento && dataNascimento !== cliente?.dataNascimento) payload.dataNascimento = dataNascimento;
    
    const emailAualCpfMascarado = cliente?.cpfMascarado || cliente?.cpf || '';
    const emailAualEmailMascarado = cliente?.emailMascarado || cliente?.email || '';
    const emailAualTelMascarado = cliente?.telefone ? `(${cliente.telefone.ddd}) ${cliente.telefone.numeroMascarado || cliente.telefone.numero}` : '';

    const isEmailChanged = visualizacaoEmail.trim() !== '' && visualizacaoEmail !== emailAualEmailMascarado;
    const isCpfChanged = visualizacaoCpf.trim() !== '' && visualizacaoCpf !== emailAualCpfMascarado;
    const isTelChanged = visualizacaoTelefone.trim() !== '' && visualizacaoTelefone !== emailAualTelMascarado;

    if (isEmailChanged) payload.email = visualizacaoEmail;
    if (isCpfChanged) payload.cpf = visualizacaoCpf.replace(/\D/g, '');
    if (isTelChanged) {
      const cleanTel = visualizacaoTelefone.replace(/\D/g, '');
      if (cleanTel.length < 10 || cleanTel.length > 11) {
        showMessage('O Telefone deve ter 10 ou 11 números, contando com o DDD.', 'error');
        return;
      }
      const ddd = cleanTel.substring(0, 2);
      const numero = cleanTel.substring(2);
      payload.telefone = { 
        tipo: novoTelefoneTipo as 'Celular' | 'Residencial' | 'Comercial', 
        ddd: ddd, 
        numero: numero 
      };
    }

    try {
      await dispatch(updatePerfilAction(payload)).unwrap();
      showMessage('Dados atualizados!', 'success');
      setShowModalSenha(false);
      setSenhaConfirmacao('');
      hasInitialized.current = false;
    } catch (err: unknown) {
      const error = err as Error;
      const errorMsg = typeof err === 'string' ? err : error.message || 'Erro na atualização segura.';
      showMessage(errorMsg, 'error');
    }
  };

  const handleChangePassword = async () => {
    if (!senhaAtual || !novaSenha || novaSenha !== confirmaNovaSenha) {
      setSenhaError('Verifique os campos de senha.');
      return;
    }
    try {
      await ClienteService.alterarSenha(user!.uuid, { senhaAtual, novaSenha, confirmacaoNovaSenha: confirmaNovaSenha });
      setSenhaSuccess('Senha alterada!');
      setSenhaAtual(''); setNovaSenha(''); setConfirmaNovaSenha('');
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || 'Erro ao alterar senha.';
      setSenhaError(errorMsg);
    }
  };

  const handleDeleteAccount = () => {
    setConfirmModalConfig({
      title: 'Inativar Conta',
      message: 'Tem certeza?',
      onConfirm: async () => {
        await ClienteService.inativarConta();
        await dispatch(logoutSession());
        navigate('/');
      },
      variant: 'danger'
    });
    setShowConfirmModal(true);
  };

  const handleAdicionarEndereco = async () => {
    try {
      const payload = {
        logradouro: novoEndLogradouro,
        numero: novoEndNumero,
        complemento: novoEndComplemento,
        bairro: novoEndBairro,
        cep: novoEndCep,
        cidade: novoEndCidade,
        estado: novoEndEstado,
        tipo: 'ambos' as const
      };

      if (enderecoEditandoUuid) {
        const novosEnderecos = await ClienteService.editarEndereco(enderecoEditandoUuid, payload);
        showMessage('Endereço atualizado!', 'success');
        atualizarListaEnderecos(novosEnderecos, enderecoEditandoUuid);
        finalizarFluxoEndereco();
        return;
      }

      const novosEnderecos = await ClienteService.adicionarEndereco(payload);
      showMessage('Endereço salvo!', 'success');
      atualizarListaEnderecos(novosEnderecos);
      finalizarFluxoEndereco();
    } catch {
      showMessage('Erro ao salvar endereço.', 'error');
    }
  };

  const atualizarListaEnderecos = (novosEnderecos: IEnderecoCliente[] | IEnderecoCliente, editandoUuid?: string | null) => {
    if (Array.isArray(novosEnderecos)) {
      dispatch(setEnderecos(novosEnderecos));
      return;
    }

    if (novosEnderecos && typeof novosEnderecos === 'object') {
      const listaAtualizada = editandoUuid 
        ? enderecos.map(e => e.uuid === editandoUuid ? novosEnderecos : e)
        : [...enderecos, novosEnderecos];
      dispatch(setEnderecos(listaAtualizada));
    }
  };

  const finalizarFluxoEndereco = () => {
    setShowNovoEndereco(false);
    setEnderecoEditandoUuid(null);
    setNovoEndLogradouro('');
    setNovoEndNumero('');
    setNovoEndComplemento('');
    setNovoEndBairro('');
    setNovoEndCep('');
    setNovoEndCidade('');
    setNovoEndEstado('');
  };

  const handleRemoverEndereco = async (uuid: string) => {
    setConfirmModalConfig({
      title: 'Remover Endereço',
      message: 'Tem certeza que deseja remover este endereço?',
      onConfirm: async () => {
        try {
          await ClienteService.removerEndereco(uuid);
          dispatch(setEnderecos(enderecos.filter(e => e.uuid !== uuid)));
          showMessage('Endereço removido!', 'success');
        } catch {
          showMessage('Erro ao remover endereço.', 'error');
        } finally {
          setShowConfirmModal(false);
        }
      },
      variant: 'danger'
    });
    setShowConfirmModal(true);
  };

  const handleAdicionarCartao = async () => {
    if (isCartaoLoading) return;

    // Validação de CVV (Apenas para novos cartões ou se preenchido na edição)
    const cvvLimpo = novoCartaoCvv.replace(/\D/g, '');
    if (!cartaoEditandoUuid && cvvLimpo.length !== 3) {
      showMessage('O CVV deve conter exatamente 3 números.', 'error');
      return;
    }
    if (cartaoEditandoUuid && cvvLimpo.length > 0 && cvvLimpo.length !== 3) {
      showMessage('O CVV deve conter exatamente 3 números.', 'error');
      return;
    }

    // Validação de Validade (MM/AAAA)
    if (!/^(0[1-9]|1[0-2])\/\d{4}$/.test(novoCartaoValidade)) {
      showMessage('A validade deve estar no formato MM/AAAA com um mês válido (01-12).', 'error');
      return;
    }

    setIsCartaoLoading(true);
    try {
      if (cartaoEditandoUuid) {
        const result = await ClienteService.editarCartao(cartaoEditandoUuid, {
          nomeImpresso: novoCartaoNome,
          bandeira: novoCartaoBandeira,
          validade: novoCartaoValidade,
        });
        
        const novosCartoes = Array.isArray(result) 
          ? result 
          : cartoes.map(c => c.uuid === cartaoEditandoUuid ? result : c);
        
        dispatch(setCartoes(novosCartoes));
        showMessage('Cartão atualizado!', 'success');
        finalizarFluxoCartao();
        return;
      }

      const novo = await ClienteService.adicionarCartao({
        ultimosDigitosCartao: novoCartaoNumero.slice(-4),
        nomeCliente: novoCartaoNome, // Adicionando nomeCliente que é obrigatório na interface
        nomeImpresso: novoCartaoNome,
        bandeira: novoCartaoBandeira,
        validade: novoCartaoValidade,
      });
      dispatch(setCartoes([...cartoes, novo]));
      showMessage('Cartão salvo!', 'success');
      finalizarFluxoCartao();
    } catch {
      showMessage('Erro ao salvar cartão.', 'error');
    } finally {
      setIsCartaoLoading(false);
    }
  };

  const finalizarFluxoCartao = () => {
    setShowNovoCartao(false);
    setCartaoEditandoUuid(null);
    setNovoCartaoNumero('');
    setNovoCartaoNome('');
    setNovoCartaoValidade('');
    setNovoCartaoCvv('');
  };

  const handleRemoverCartao = async (uuid: string) => {
    setConfirmModalConfig({
      title: 'Remover Cartão',
      message: 'Tem certeza que deseja remover este cartão?',
      onConfirm: async () => {
        setIsCartaoLoading(true);
        try {
          await ClienteService.removerCartao(uuid);
          dispatch(setCartoes(cartoes.filter(c => c.uuid !== uuid)));
          showMessage('Cartão removido!', 'success');
        } catch {
          showMessage('Erro ao remover cartão.', 'error');
        } finally {
          setIsCartaoLoading(false);
          setShowConfirmModal(false);
        }
      },
      variant: 'danger'
    });
    setShowConfirmModal(true);
  };

  const handleDefinirPreferencial = async (uuid: string) => {
    if (isCartaoLoading) return;
    setIsCartaoLoading(true);
    try {
      await ClienteService.definirCartaoPreferencial(uuid);
      setCartaoPreferencialUuid(uuid);
    } catch {
      showMessage('Erro ao definir cartão preferencial.', 'error');
    } finally {
      setIsCartaoLoading(false);
    }
  };

  return {
    user, isLoading, message, messageType, cliente,
    perfilState: {
      nome, setNome, genero, setGenero, dataNascimento, setDataNascimento,
      visualizacaoEmail, setVisualizacaoEmail, visualizacaoCpf, setVisualizacaoCpf, visualizacaoTelefone, setVisualizacaoTelefone,
      novoEmail, setNovoEmail, novoCpf, setNovoCpf,
      novoTelefoneDdd, setNovoTelefoneDdd, novoTelefoneNumero, setNovoTelefoneNumero, novoTelefoneTipo, setNovoTelefoneTipo,
      senhaConfirmacao, setSenhaConfirmacao, showSenhaConfirmacao, setShowSenhaConfirmacao,
      showModalSenha, setShowModalSenha, handleUpdateProfile, confirmarUpdateComSenha,
    },
    senhaState: {
      senhaAtual, setSenhaAtual, showSenhaAtual, setShowSenhaAtual,
      novaSenha, setNovaSenha, showNovaSenha, setShowNovaSenha,
      confirmaNovaSenha, setConfirmaNovaSenha, showConfirmaNovaSenha, setShowConfirmaNovaSenha,
      senhaError, senhaSuccess, handleChangePassword,
    },
    enderecoState: {
      enderecos,
      showNovoEndereco,
      setShowNovoEndereco,
      enderecoEditandoUuid,
      setEnderecoEditandoUuid,
      novoEndLogradouro,
      setNovoEndLogradouro,
      novoEndNumero,
      setNovoEndNumero,
      novoEndComplemento,
      setNovoEndComplemento,
      novoEndBairro,
      setNovoEndBairro,
      novoEndCep,
      setNovoEndCep,
      novoEndCidade,
      setNovoEndCidade,
      novoEndEstado,
      setNovoEndEstado,
      handleAdicionarEndereco,
      handleRemoverEndereco,
    },
    cartaoState: {
      cartoes, cartaoPreferencialUuid, showNovoCartao, setShowNovoCartao,
      novoCartaoNumero, setNovoCartaoNumero, novoCartaoNome, setNovoCartaoNome,
      novoCartaoBandeira, setNovoCartaoBandeira, novoCartaoValidade, setNovoCartaoValidade,
      novoCartaoCvv, setNovoCartaoCvv, showNovoCartaoCvv, setShowNovoCartaoCvv,
      cartaoEditandoUuid, setCartaoEditandoUuid,
      handleAdicionarCartao, handleRemoverCartao,
      handleDefinirPreferencial,
      isLoading: isCartaoLoading,
    },
    handleDeleteAccount, secaoAtiva, setSecaoAtiva,
    dominios: { generosDisponiveis, tiposTelefone, bandeirasPermitidas },
    confirmModal: { show: showConfirmModal, config: confirmModalConfig, close: () => setShowConfirmModal(false) }
  };
}
