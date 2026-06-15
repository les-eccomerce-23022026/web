import { useState, useEffect, useCallback } from 'react';
import type { ILoja, ILojaFormState } from '../../../interfaces/loja';
import { lojaService } from '../../../services/lojaService';

const ITENS_POR_PAGINA = 20;

const INITIAL_FORM: ILojaFormState = {
  nome: '',
  slug: '',
  cnpj: '',
};

export type IFiltroStatus = 'todos' | 'ativo' | 'inativo';

export function useGerenciarLojas() {
  const [lojas, setLojas] = useState<ILoja[]>([]);
  const [total, setTotal] = useState(0);
  const [totalAtivas, setTotalAtivas] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLoja, setEditingLoja] = useState<ILoja | null>(null);
  const [form, setForm] = useState<ILojaFormState>(INITIAL_FORM);
  const [showForm, setShowForm] = useState(false);
  const [pageMessage, setPageMessage] = useState('');
  const [pageMessageType, setPageMessageType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState('');
  const [modalMessageType, setModalMessageType] = useState<'success' | 'error'>('error');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lojaToToggle, setLojaToToggle] = useState<ILoja | null>(null);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<IFiltroStatus>('todos');
  const [paginaAtual, setPaginaAtual] = useState(1);

  const carregarLojas = useCallback(async (pagina: number, nome: string, status: IFiltroStatus) => {
    setIsLoading(true);
    try {
      const ativo =
        status === 'ativo' ? true : status === 'inativo' ? false : null;

      const resposta = await lojaService.listarLojas({
        pagina,
        limite: ITENS_POR_PAGINA,
        nome: nome || undefined,
        ativo: ativo ?? undefined,
      });

      setLojas(resposta.lojas);
      setTotal(resposta.total);
      setTotalPaginas(resposta.totalPaginas);

      // Calcula total de ativas: se a API retornar tudo, conta direto;
      // caso contrário, faz chamada separada para contar ativas
      if (status === 'ativo') {
        setTotalAtivas(resposta.total);
      } else if (status === 'inativo') {
        // mantém o valor que já temos (outra chamada seria necessária)
        // para não exceder requests, recalculamos ao carregar 'todos'
      } else {
        const qtdAtivas = resposta.lojas.filter((l) => l.ativo).length;
        // se está na primeira página e total === lojas.length, podemos contar diretamente
        if (resposta.total === resposta.lojas.length) {
          setTotalAtivas(qtdAtivas);
        }
        // caso contrário, mantém valor anterior (sem request extra)
      }
    } catch (erro: unknown) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao carregar lojas';
      showPageFeedback(mensagem, 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarLojas(paginaAtual, filtroNome, filtroStatus);
  }, [paginaAtual, filtroNome, filtroStatus, carregarLojas]);

  function showPageFeedback(msg: string, type: 'success' | 'error' = 'success') {
    setPageMessage(msg);
    setPageMessageType(type);
    if (type === 'success') {
      setTimeout(() => setPageMessage(''), 5000);
    }
  }

  function showModalFeedback(msg: string, type: 'success' | 'error' = 'error') {
    setModalMessage(msg);
    setModalMessageType(type);
  }

  function clearModalFeedback() {
    setModalMessage('');
    setModalMessageType('error');
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingLoja(null);
    setShowForm(false);
    setIsConfirmModalOpen(false);
    clearModalFeedback();
  }

  function startCreate() {
    setEditingLoja(null);
    setForm(INITIAL_FORM);
    setShowForm(true);
    clearModalFeedback();
  }

  function startEdit(loja: ILoja) {
    setEditingLoja(loja);
    setForm({
      nome: loja.nome,
      slug: loja.slug,
      cnpj: loja.cnpj,
    });
    setShowForm(true);
    clearModalFeedback();
  }

  function handleFieldChange(field: keyof ILojaFormState, value: string) {
    if (modalMessage) {
      clearModalFeedback();
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function gerarSlugDoNome(nome: string) {
    const slug = nome
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]/g, '');
    setForm((prev) => ({ ...prev, slug }));
  }

  function validarCNPJ(cnpj: string): boolean {
    const apenasNumeros = cnpj.replace(/\D/g, '');
    if (apenasNumeros.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(apenasNumeros)) return false;

    let soma = 0;
    let multiplicador = 5;
    for (let i = 0; i < 8; i++) {
      soma += parseInt(apenasNumeros[i]) * multiplicador;
      multiplicador -= 1;
    }
    let resto = soma % 11;
    const primeiroDigito = resto < 2 ? 0 : 11 - resto;

    soma = 0;
    multiplicador = 6;
    for (let i = 0; i < 8; i++) {
      soma += parseInt(apenasNumeros[i]) * multiplicador;
      multiplicador -= 1;
    }
    soma += primeiroDigito * 2;
    resto = soma % 11;
    const segundoDigito = resto < 2 ? 0 : 11 - resto;

    return (
      parseInt(apenasNumeros[8]) === primeiroDigito &&
      parseInt(apenasNumeros[9]) === segundoDigito
    );
  }

  function validarSlug(slug: string): boolean {
    return /^[a-z\-]{3,}$/.test(slug);
  }

  function validarFormulario(): string | null {
    if (!form.nome.trim()) return 'Nome da loja é obrigatório';
    if (form.nome.trim().length < 3) return 'Nome deve ter no mínimo 3 caracteres';
    if (!form.slug.trim()) return 'Slug é obrigatório';
    if (!validarSlug(form.slug))
      return 'Slug deve ter no mínimo 3 caracteres e conter apenas letras minúsculas e hífens';
    if (!form.cnpj.trim()) return 'CNPJ é obrigatório';
    if (!validarCNPJ(form.cnpj)) return 'CNPJ inválido';
    return null;
  }

  function triggerSaveConfirm() {
    const erro = validarFormulario();
    if (erro) {
      showModalFeedback(erro, 'error');
      return;
    }
    clearModalFeedback();
    setIsConfirmModalOpen(true);
  }

  async function verificarSlugUnico(slug: string, uuidAtual?: string): Promise<boolean> {
    try {
      return await lojaService.verificarSlugDisponivel(slug, uuidAtual);
    } catch {
      return false;
    }
  }

  async function handleSave() {
    try {
      clearModalFeedback();

      const erro = validarFormulario();
      if (erro) {
        showModalFeedback(erro, 'error');
        return;
      }

      const slugUnico = await verificarSlugUnico(form.slug, editingLoja?.uuid);
      if (!slugUnico) {
        showModalFeedback('Slug já está em uso por outra loja', 'error');
        return;
      }

      if (editingLoja) {
        await lojaService.atualizarLoja(editingLoja.uuid, {
          nome: form.nome,
          slug: form.slug,
          cnpj: form.cnpj,
        });
        showPageFeedback('Loja atualizada com sucesso!');
      } else {
        await lojaService.criarLoja({
          nome: form.nome,
          slug: form.slug,
          cnpj: form.cnpj,
          ativo: true,
        });
        showPageFeedback('Loja criada com sucesso!');
      }

      await carregarLojas(paginaAtual, filtroNome, filtroStatus);
      resetForm();
    } catch (erro: unknown) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao salvar loja';
      setIsConfirmModalOpen(false);
      showModalFeedback(mensagem, 'error');
    }
  }

  function triggerDelete(uuid: string) {
    const loja = lojas.find((l) => l.uuid === uuid);
    if (loja) {
      setLojaToToggle(loja);
      setIsDeleteModalOpen(true);
    }
  }

  async function handleDelete() {
    if (!lojaToToggle) return;

    try {
      if (lojaToToggle.ativo) {
        await lojaService.inativarLoja(lojaToToggle.uuid);
        showPageFeedback(`Loja "${lojaToToggle.nome}" desativada com sucesso!`);
      } else {
        await lojaService.ativarLoja(lojaToToggle.uuid);
        showPageFeedback(`Loja "${lojaToToggle.nome}" ativada com sucesso!`);
      }
      setIsDeleteModalOpen(false);
      setLojaToToggle(null);
      await carregarLojas(paginaAtual, filtroNome, filtroStatus);
    } catch (erro: unknown) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao alterar status da loja';
      showPageFeedback(mensagem, 'error');
      setIsDeleteModalOpen(false);
      setLojaToToggle(null);
    }
  }

  function handleFiltroNomeChange(valor: string) {
    setFiltroNome(valor);
    setPaginaAtual(1);
  }

  function handleFiltroStatusChange(valor: IFiltroStatus) {
    setFiltroStatus(valor);
    setPaginaAtual(1);
  }

  return {
    lojas,
    total,
    totalAtivas,
    totalPaginas,
    isLoading,
    form,
    showForm,
    editingLoja,
    pageMessage,
    pageMessageType,
    modalMessage,
    modalMessageType,
    isConfirmModalOpen,
    isDeleteModalOpen,
    lojaToToggle,
    filtroNome,
    filtroStatus,
    paginaAtual,
    setIsConfirmModalOpen,
    setIsDeleteModalOpen,
    setPaginaAtual,
    handleFiltroNomeChange,
    handleFiltroStatusChange,
    startCreate,
    startEdit,
    handleFieldChange,
    gerarSlugDoNome,
    triggerSaveConfirm,
    handleSave,
    triggerDelete,
    handleDelete,
    cancelForm: resetForm,
  };
}
