import { useState, useEffect } from 'react';
import type { ILoja, ILojaFormState } from '../../../interfaces/loja';
import { lojaService } from '../../../services/lojaService';

const INITIAL_FORM: ILojaFormState = {
  nome: '',
  slug: '',
  cnpj: '',
};

export function useGerenciarLojas() {
  const [lojas, setLojas] = useState<ILoja[]>([]);
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
  const [filtro, setFiltro] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(10);

  // Carrega lojas da API
  async function carregarLojas() {
    setIsLoading(true);
    try {
      const dados = await lojaService.listarLojas();
      setLojas(dados);
    } catch (erro: unknown) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao carregar lojas';
      showPageFeedback(mensagem, 'error');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    carregarLojas();
  }, []);

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

  /**
   * Auto-gera slug a partir do nome
   */
  function gerarSlugDoNome(nome: string) {
    const slug = nome
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]/g, '');
    setForm((prev) => ({ ...prev, slug }));
  }

  /**
   * Valida CNPJ usando algoritmo padrão de dígitos verificadores
   */
  function validarCNPJ(cnpj: string): boolean {
    const apenasNumeros = cnpj.replace(/\D/g, '');

    if (apenasNumeros.length !== 14) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(apenasNumeros)) return false;

    // Calcula primeiro dígito verificador
    let soma = 0;
    let multiplicador = 5;
    for (let i = 0; i < 8; i++) {
      soma += parseInt(apenasNumeros[i]) * multiplicador;
      multiplicador -= 1;
    }
    let resto = soma % 11;
    const primeiroDigito = resto < 2 ? 0 : 11 - resto;

    // Calcula segundo dígito verificador
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

  /**
   * Valida slug (apenas letras minúsculas e hífens)
   */
  function validarSlug(slug: string): boolean {
    return /^[a-z\-]{3,}$/.test(slug);
  }

  /**
   * Valida todos os campos do formulário
   */
  function validarFormulario(): string | null {
    if (!form.nome.trim()) {
      return 'Nome da loja é obrigatório';
    }
    if (form.nome.trim().length < 3) {
      return 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!form.slug.trim()) {
      return 'Slug é obrigatório';
    }
    if (!validarSlug(form.slug)) {
      return 'Slug deve ter no mínimo 3 caracteres e conter apenas letras minúsculas e hífens';
    }

    if (!form.cnpj.trim()) {
      return 'CNPJ é obrigatório';
    }
    if (!validarCNPJ(form.cnpj)) {
      return 'CNPJ inválido';
    }

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

  /**
   * Verifica se slug é único via API
   */
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

      // Verifica slug único
      const slugUnico = await verificarSlugUnico(form.slug, editingLoja?.uuid);
      if (!slugUnico) {
        showModalFeedback('Slug já está em uso por outra loja', 'error');
        return;
      }

      if (editingLoja) {
        // Editar loja
        await lojaService.atualizarLoja(editingLoja.uuid, {
          nome: form.nome,
          slug: form.slug,
          cnpj: form.cnpj,
        });

        showPageFeedback('Loja atualizada com sucesso!');
        await carregarLojas();
        resetForm();
        return;
      }

      // Criar nova loja
      await lojaService.criarLoja({
        nome: form.nome,
        slug: form.slug,
        cnpj: form.cnpj,
        ativo: true,
      });

      showPageFeedback('Loja criada com sucesso!');
      await carregarLojas();
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
      // Implementar endpoint de ativação/desativação se necessário
      showPageFeedback('Funcionalidade de exclusão ainda não implementada no backend');
      setIsDeleteModalOpen(false);
      setLojaToToggle(null);
    } catch (erro: unknown) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao alterar status da loja';
      showPageFeedback(mensagem, 'error');
    }
  }

  // Filtrar lojas
  const lojasFiltradas = lojas.filter((loja) => {
    const termo = filtro.toLowerCase();
    return (
      loja.nome.toLowerCase().includes(termo) ||
      loja.slug.toLowerCase().includes(termo) ||
      loja.cnpj.includes(termo)
    );
  });

  // Paginar
  const totalPaginas = Math.ceil(lojasFiltradas.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const lojasPaginadas = lojasFiltradas.slice(indiceInicio, indiceInicio + itensPorPagina);

  return {
    lojas: lojasPaginadas,
    lojasFiltradas,
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
    filtro,
    paginaAtual,
    totalPaginas,
    setIsConfirmModalOpen,
    setIsDeleteModalOpen,
    setFiltro,
    setPaginaAtual,
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
