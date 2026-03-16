import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { ClienteService } from '@/services/ClienteService';
import type { ICliente, IAtualizarPerfilPayload, Genero } from '@/interfaces/ICliente';
import type { IEnderecoCliente, ICartaoCliente } from '@/interfaces/IPagamento';
import clientesMock from '@/mocks/clientesMock.json';

const REGEX_SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;

export function useMeuPerfil() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // --- Loading / Messages ---
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // --- Perfil ---
  const [cliente, setCliente] = useState<ICliente | null>(null);
  const [nome, setNome] = useState('');
  const [genero, setGenero] = useState<Genero>('Masculino');
  const [dataNascimento, setDataNascimento] = useState('');

  // Estados para edição segura (RF0022 reforçado)
  const [cpfEdicao, setCpfEdicao] = useState('');
  const [telefoneDdd, setTelefoneDdd] = useState('');
  const [telefoneNumero, setTelefoneNumero] = useState('');
  const [telefoneTipo, setTelefoneTipo] = useState('Celular');
  const [senhaConfirmacao, setSenhaConfirmacao] = useState('');
  const [showSenhaConfirmacao, setShowSenhaConfirmacao] = useState(false);
  const [showModalSenha, setShowModalSenha] = useState(false);

  // --- Senha ---
  const [senhaAtual, setSenhaAtual] = useState('');
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [confirmaNovaSenha, setConfirmaNovaSenha] = useState('');
  const [showConfirmaNovaSenha, setShowConfirmaNovaSenha] = useState(false);
  const [senhaError, setSenhaError] = useState('');
  const [senhaSuccess, setSenhaSuccess] = useState('');

  // --- Endereços ---
  const [enderecos, setEnderecos] = useState<IEnderecoCliente[]>([]);
  const [showNovoEndereco, setShowNovoEndereco] = useState(false);
  const [enderecoEditandoUuid, setEnderecoEditandoUuid] = useState<string | null>(null);

  // --- Modal Confirmação ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'medium';
  }>({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const openConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    variant: 'danger' | 'medium' = 'medium'
  ) => {
    setConfirmModalConfig({ title, message, onConfirm, variant });
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => setShowConfirmModal(false);

  // --- Cartões ---
  const [cartoes, setCartoes] = useState<ICartaoCliente[]>([]);
  const [cartaoPreferencialUuid, setCartaoPreferencialUuid] = useState<string | null>(null);
  const [showNovoCartao, setShowNovoCartao] = useState(false);

  // --- Novo Endereço Form ---
  const [novoEndApelido, setNovoEndApelido] = useState('');
  const [novoEndTipoResidencia, setNovoEndTipoResidencia] = useState('Casa');
  const [novoEndTipoLogradouro, setNovoEndTipoLogradouro] = useState('Rua');
  const [novoEndLogradouro, setNovoEndLogradouro] = useState('');
  const [novoEndNumero, setNovoEndNumero] = useState('');
  const [novoEndComplemento, setNovoEndComplemento] = useState('');
  const [novoEndBairro, setNovoEndBairro] = useState('');
  const [novoEndCep, setNovoEndCep] = useState('');
  const [novoEndCidade, setNovoEndCidade] = useState('');
  const [novoEndEstado, setNovoEndEstado] = useState('');
  const [novoEndPais, setNovoEndPais] = useState('Brasil');

  // --- Novo Cartão Form ---
  const [novoCartaoNumero, setNovoCartaoNumero] = useState('');
  const [novoCartaoNome, setNovoCartaoNome] = useState('');
  const [novoCartaoBandeira, setNovoCartaoBandeira] = useState('Visa');
  const [novoCartaoValidade, setNovoCartaoValidade] = useState('');
  const [novoCartaoCvv, setNovoCartaoCvv] = useState('');
  const [showNovoCartaoCvv, setShowNovoCartaoCvv] = useState(false);

  // --- Seção ativa ---
  const [secaoAtiva, setSecaoAtiva] = useState<'perfil' | 'enderecos' | 'cartoes' | 'senha' | 'perigo'>('perfil');

  // --- Domínios ---
  const generosDisponiveis = clientesMock.generosDisponiveis;
  const tiposTelefone = clientesMock.tiposTelefone;
  const tiposResidencia = clientesMock.tiposResidencia;
  const tiposLogradouro = clientesMock.tiposLogradouro;
  const bandeirasPermitidas = clientesMock.bandeirasPermitidas;

  const showMessage = useCallback((msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  }, []);

  // --- Carregar Perfil ---
  useEffect(() => {
    if (!user) return;

    const carregarPerfil = async () => {
      try {
        const perfil = await ClienteService.obterPerfil(user.uuid);
        setCliente(perfil);
        setNome(perfil.nome);
        setGenero(perfil.genero);
        setDataNascimento(perfil.dataNascimento);
        setCpfEdicao(perfil.cpfMascarado || perfil.cpf);
        setEnderecos(perfil.enderecos || []);
        setCartaoPreferencialUuid(perfil.cartaoPreferencialUuid);
        
        // Telefone pode ser undefined se não foi cadastrado
        if (perfil.telefone) {
          setTelefoneTipo(perfil.telefone.tipo);
          setTelefoneDdd(perfil.telefone.ddd);
          setTelefoneNumero(perfil.telefone.numeroMascarado || perfil.telefone.numero);
        }

        if (!perfil.telefone) {
          setTelefoneTipo('Celular');
          setTelefoneDdd('');
          setTelefoneNumero('');
        }

        const cartoesResult = await ClienteService.listarCartoes(user.uuid);
        setCartoes(cartoesResult);
      } catch (err) {
        showMessage('Erro ao carregar perfil.', 'error');
        console.error('[Perfil] Erro:', err);
      } finally {
        setIsLoading(false);
      }
    };

    carregarPerfil();
  }, [user, showMessage]);

  // --- Atualizar Perfil ---
  const handleUpdateProfile = async () => {
    if (!nome.trim()) {
      showMessage('Nome é obrigatório.', 'error');
      return;
    }

    const payload: IAtualizarPerfilPayload = {};

    // 1. Verificar o que mudou (Comparação cirúrgica)
    if (nome !== cliente?.nome) payload.nome = nome;
    if (genero !== cliente?.genero) payload.genero = genero;
    if (dataNascimento !== cliente?.dataNascimento) payload.dataNascimento = dataNascimento;

    // 2. Dados críticos: Só enviar se NÃO estiverem mascarados e forem diferentes do original
    const cpfOriginal = cliente?.cpfMascarado || cliente?.cpf;
    const cpfMudou = cpfEdicao !== cpfOriginal && !cpfEdicao.includes('*');
    if (cpfMudou) payload.cpf = cpfEdicao;

    const telOriginal = cliente?.telefone?.numeroMascarado || cliente?.telefone?.numero || '';
    const telMudou = (telefoneNumero !== telOriginal || telefoneDdd !== cliente?.telefone?.ddd || telefoneTipo !== cliente?.telefone?.tipo) 
                     && !telefoneNumero.includes('*');

    if (telMudou) {
      payload.telefone = {
        tipo: telefoneTipo as any,
        ddd: telefoneDdd,
        numero: telefoneNumero,
      };
    }

    // 3. Se nada mudou, avisar e não fazer nada
    if (Object.keys(payload).length === 0) {
      showMessage('Nenhuma alteração detectada.', 'success');
      return;
    }

    // 4. Se mudou dado crítico, abrir o modal de senha
    if (cpfMudou || telMudou) {
      setShowModalSenha(true);
      return; // Para aqui, espera o modal
    }

    // 5. Se mudou apenas dados básicos (nome, gênero, etc), executa direto
    try {
      await ClienteService.atualizarPerfil(payload);
      showMessage('Dados atualizados com sucesso!', 'success');
      const perfilAtualizado = await ClienteService.obterPerfil(user!.uuid);
      setCliente(perfilAtualizado);
    } catch (err: any) {
      showMessage(err.message || 'Erro ao atualizar dados.', 'error');
    }
  };

  const confirmarUpdateComSenha = async () => {
    if (!senhaConfirmacao) {
      showMessage('Informe sua senha para confirmar.', 'error');
      return;
    }

    const payload: IAtualizarPerfilPayload = {
      nome,
      genero,
      dataNascimento,
      senhaConfirmacao,
    };

    // Adiciona dados críticos ao payload
    if (!cpfEdicao.includes('*')) payload.cpf = cpfEdicao;
    if (!telefoneNumero.includes('*')) {
      payload.telefone = {
        tipo: telefoneTipo as any,
        ddd: telefoneDdd,
        numero: telefoneNumero,
      };
    }

    try {
      await ClienteService.atualizarPerfil(payload);
      showMessage('Dados críticos atualizados com sucesso!', 'success');
      setShowModalSenha(false);
      setSenhaConfirmacao('');
      const perfilAtualizado = await ClienteService.obterPerfil(user!.uuid);
      setCliente(perfilAtualizado);
    } catch (err: any) {
      showMessage(err.message || 'Senha inválida ou erro na atualização.', 'error');
    }
  };

  // --- Alterar Senha ---
  const handleChangePassword = async () => {
    setSenhaError('');
    setSenhaSuccess('');

    if (!senhaAtual) {
      setSenhaError('Informe a senha atual.');
      return;
    }

    if (!REGEX_SENHA_FORTE.test(novaSenha)) {
      setSenhaError('Nova senha deve ter 8+ caracteres, maiúsculas, minúsculas, números e especiais.');
      return;
    }

    if (novaSenha !== confirmaNovaSenha) {
      setSenhaError('As senhas não coincidem.');
      return;
    }

    if (!user) return;

    try {
      await ClienteService.alterarSenha(user.uuid, {
        senhaAtual,
        novaSenha,
        confirmacaoNovaSenha: confirmaNovaSenha,
      });
      setSenhaSuccess('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmaNovaSenha('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao alterar senha.';
      setSenhaError(errorMsg);
      console.error('[Perfil] Erro ao alterar senha:', err);
    }
  };

  // --- Inativar Conta ---
  const handleDeleteAccount = async () => {
    openConfirmModal(
      'Inativar Conta',
      'Tem certeza que deseja inativar sua conta? Esta ação não pode ser desfeita.',
      async () => {
        try {
          await ClienteService.inativarConta();
          dispatch(logout());
          navigate('/');
        } catch (err) {
          showMessage('Erro ao inativar conta.', 'error');
          console.error('[Perfil] Erro ao inativar:', err);
        } finally {
          closeConfirmModal();
        }
      },
      'danger'
    );
  };

  // --- Adicionar Endereço ---
  const handleAdicionarEndereco = async () => {
    if (!novoEndLogradouro.trim() || !novoEndNumero.trim() || !novoEndBairro.trim() || !novoEndCep.trim() || !novoEndCidade.trim() || !novoEndEstado.trim()) {
      showMessage('Preencha todos os campos obrigatórios do endereço.', 'error');
      return;
    }

    try {
      const novoEndereco = await ClienteService.adicionarEndereco({
        apelido: novoEndApelido,
        tipoResidencia: novoEndTipoResidencia,
        tipoLogradouro: novoEndTipoLogradouro,
        logradouro: novoEndLogradouro,
        numero: novoEndNumero,
        complemento: novoEndComplemento,
        bairro: novoEndBairro,
        cep: novoEndCep,
        cidade: novoEndCidade,
        estado: novoEndEstado,
        pais: novoEndPais,
      });

      setEnderecos((prev) => [...prev, novoEndereco]);
      limparFormEndereco();
      setShowNovoEndereco(false);
      showMessage('Endereço adicionado com sucesso!', 'success');
    } catch (err) {
      showMessage('Erro ao adicionar endereço.', 'error');
      console.error('[Perfil] Erro ao adicionar endereço:', err);
    }
  };

  const limparFormEndereco = () => {
    setNovoEndApelido('');
    setNovoEndTipoResidencia('Casa');
    setNovoEndTipoLogradouro('Rua');
    setNovoEndLogradouro('');
    setNovoEndNumero('');
    setNovoEndComplemento('');
    setNovoEndBairro('');
    setNovoEndCep('');
    setNovoEndCidade('');
    setNovoEndEstado('');
    setNovoEndPais('Brasil');
  };

  // --- Remover Endereço ---
  const handleRemoverEndereco = async (uuid: string) => {
    openConfirmModal(
      'Remover Endereço',
      'Tem certeza que deseja remover este endereço?',
      async () => {
        try {
          await ClienteService.removerEndereco(uuid);
          setEnderecos((prev) => prev.filter((e) => e.uuid !== uuid));
          showMessage('Endereço removido.', 'success');
        } catch (err) {
          showMessage('Erro ao remover endereço.', 'error');
          console.error('[Perfil] Erro ao remover endereço:', err);
        } finally {
          closeConfirmModal();
        }
      },
      'danger'
    );
  };

  // --- Adicionar Cartão ---
  const handleAdicionarCartao = async () => {
    if (!novoCartaoNumero || !novoCartaoNome || !novoCartaoValidade || !novoCartaoCvv) {
      showMessage('Preencha todos os campos do cartão.', 'error');
      return;
    }

    const final4 = novoCartaoNumero.slice(-4);

    try {
      const novoCartao = await ClienteService.adicionarCartao({
        final: final4,
        nomeImpresso: novoCartaoNome.toUpperCase(),
        bandeira: novoCartaoBandeira,
        validade: novoCartaoValidade,
      });

      setCartoes((prev) => [...prev, novoCartao]);
      limparFormCartao();
      setShowNovoCartao(false);
      showMessage('Cartão adicionado com sucesso!', 'success');
    } catch (err) {
      showMessage('Erro ao adicionar cartão.', 'error');
      console.error('[Perfil] Erro ao adicionar cartão:', err);
    }
  };

  const limparFormCartao = () => {
    setNovoCartaoNumero('');
    setNovoCartaoNome('');
    setNovoCartaoBandeira('Visa');
    setNovoCartaoValidade('');
    setNovoCartaoCvv('');
  };

  // --- Remover Cartão ---
  const handleRemoverCartao = async (uuid: string) => {
    openConfirmModal(
      'Remover Cartão',
      'Tem certeza que deseja remover este cartão?',
      async () => {
        try {
          await ClienteService.removerCartao(uuid);
          setCartoes((prev) => prev.filter((c) => c.uuid !== uuid));
          if (cartaoPreferencialUuid === uuid) {
            setCartaoPreferencialUuid(null);
          }
          showMessage('Cartão removido.', 'success');
        } catch (err) {
          showMessage('Erro ao remover cartão.', 'error');
          console.error('[Perfil] Erro ao remover cartão:', err);
        } finally {
          closeConfirmModal();
        }
      },
      'danger'
    );
  };

  // --- Definir Cartão Preferencial ---
  const handleDefinirPreferencial = async (uuid: string) => {
    try {
      await ClienteService.definirCartaoPreferencial(uuid);
      setCartaoPreferencialUuid(uuid);
      showMessage('Cartão preferencial definido!', 'success');
    } catch (err) {
      showMessage('Erro ao definir cartão preferencial.', 'error');
      console.error('[Perfil] Erro ao definir preferencial:', err);
    }
  };

  return {
    user,
    isLoading,
    message,
    messageType,
    cliente,

    // Perfil
    perfilState: {
      nome, setNome,
      cpf: cpfEdicao, setCpfEdicao,
      genero, setGenero,
      dataNascimento, setDataNascimento,
      telefoneTipo, setTelefoneTipo,
      telefoneDdd, setTelefoneDdd,
      telefoneNumero, setTelefoneNumero,
      senhaConfirmacao, setSenhaConfirmacao,
      showSenhaConfirmacao, setShowSenhaConfirmacao,
      showModalSenha, setShowModalSenha,
      handleUpdateProfile,
      confirmarUpdateComSenha,
    },

    // Senha
    senhaState: {
      senhaAtual, setSenhaAtual,
      showSenhaAtual, setShowSenhaAtual,
      novaSenha, setNovaSenha,
      showNovaSenha, setShowNovaSenha,
      confirmaNovaSenha, setConfirmaNovaSenha,
      showConfirmaNovaSenha, setShowConfirmaNovaSenha,
      senhaError, senhaSuccess,
      handleChangePassword,
    },

    // Endereços
    enderecoState: {
      enderecos,
      showNovoEndereco, setShowNovoEndereco,
      enderecoEditandoUuid, setEnderecoEditandoUuid,
      novoEndApelido, setNovoEndApelido,
      novoEndTipoResidencia, setNovoEndTipoResidencia,
      novoEndTipoLogradouro, setNovoEndTipoLogradouro,
      novoEndLogradouro, setNovoEndLogradouro,
      novoEndNumero, setNovoEndNumero,
      novoEndComplemento, setNovoEndComplemento,
      novoEndBairro, setNovoEndBairro,
      novoEndCep, setNovoEndCep,
      novoEndCidade, setNovoEndCidade,
      novoEndEstado, setNovoEndEstado,
      novoEndPais, setNovoEndPais,
      handleAdicionarEndereco,
      handleRemoverEndereco,
    },

    // Cartões
    cartaoState: {
      cartoes,
      cartaoPreferencialUuid,
      showNovoCartao, setShowNovoCartao,
      novoCartaoNumero, setNovoCartaoNumero,
      novoCartaoNome, setNovoCartaoNome,
      novoCartaoBandeira, setNovoCartaoBandeira,
      novoCartaoValidade, setNovoCartaoValidade,
      novoCartaoCvv, setNovoCartaoCvv,
      showNovoCartaoCvv, setShowNovoCartaoCvv,
      handleAdicionarCartao,
      handleRemoverCartao,
      handleDefinirPreferencial,
    },

    // Zona de perigo
    handleDeleteAccount,

    // Seção ativa (tab navigation)
    secaoAtiva, setSecaoAtiva,

    // Domínios
    dominios: {
      generosDisponiveis,
      tiposTelefone,
      tiposResidencia,
      tiposLogradouro,
      bandeirasPermitidas,
    },

    // Modal de Confirmação
    confirmModal: {
      show: showConfirmModal,
      config: confirmModalConfig,
      close: closeConfirmModal,
    }
  };
}
