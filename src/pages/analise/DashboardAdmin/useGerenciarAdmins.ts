import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import type { IAdmin, IAdminFormState } from '@/interfaces/IAdmin';
import {
  fetchAdmins,
  updateAdmin,
}  from '@/store/slices/adminSlice';
import { AuthService } from '@/services/AuthService';

const INITIAL_FORM: IAdminFormState = { 
  nome: '', 
  cpf: '', 
  email: '', 
  senha: '', 
  confirmacaoSenha: '',
  usarMesmaSenha: false
};

export function useGerenciarAdmins() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { admins, isLoading } = useAppSelector((state) => state.admin);

  const [editingAdmin, setEditingAdmin] = useState<IAdmin | null>(null);
  const [form, setForm] = useState<IAdminFormState>(INITIAL_FORM);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pageMessage, setPageMessage] = useState('');
  const [pageMessageType, setPageMessageType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState('');
  const [modalMessageType, setModalMessageType] = useState<'success' | 'error'>('error');

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToToggle, setAdminToToggle] = useState<IAdmin | null>(null);

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

  function normalizeAdminSaveError(errorMessage: string) {
    if (errorMessage.includes('O usuário informado já possui papel de administrador.')) {
      return 'Este usuário já possui papel de administrador.';
    }

    if (errorMessage.includes('A senha administrativa deve ser diferente da senha atual do usuário.')) {
      return 'A senha administrativa deve ser diferente da senha atual do usuário.';
    }

    return errorMessage;
  }

  function clearModalFeedback() {
    setModalMessage('');
    setModalMessageType('error');
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingAdmin(null);
    setShowForm(false);
    setIsConfirmModalOpen(false);
    clearModalFeedback();
  }

  function startCreate() {
    setEditingAdmin(null);
    setForm(INITIAL_FORM);
    setShowForm(true);
    clearModalFeedback();
  }

  function startEdit(admin: IAdmin) {
    setEditingAdmin(admin);
    setForm({ 
      nome: admin.nome, 
      cpf: '', // CPF geralmente não é editável ou não retornado
      email: admin.email, 
      senha: '', 
      confirmacaoSenha: '',
      usarMesmaSenha: false
    });
    setShowForm(true);
    clearModalFeedback();
  }

  function handleFieldChange(field: keyof IAdminFormState, value: string | boolean) {
    if (modalMessage) {
      clearModalFeedback();
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function triggerSaveConfirm() {
    if (!isAuthenticated || user?.role !== 'admin') {
      showModalFeedback('Você precisa estar autenticado para gerenciar administradores.', 'error');
      return;
    }

    if (!editingAdmin) {
      if (!form.nome || !form.cpf || !form.email) {
        showModalFeedback('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
      }

      if (!form.usarMesmaSenha) {
        if (!form.senha) {
          showModalFeedback('Por favor, defina uma senha para o administrador.', 'error');
          return;
        }
        if (form.senha !== form.confirmacaoSenha) {
          showModalFeedback('As senhas não conferem.', 'error');
          return;
        }
      }
    }

    clearModalFeedback();
    setIsConfirmModalOpen(true);
  }

  async function handleSave() {
    try {
      clearModalFeedback();

      if (editingAdmin) {
        dispatch(
          updateAdmin({
            ...editingAdmin,
            nome: form.nome,
            email: form.email,
          }),
        );
        showPageFeedback('Administrador atualizado com sucesso.');
        resetForm();
        return;
      }

      // Chamada Real para o Backend
      await AuthService.registrarAdmin({
        nome: form.nome,
        cpf: form.cpf,
        email: form.email,
        senha: form.senha,
        confirmacaoSenha: form.confirmacaoSenha,
        usarMesmaSenha: form.usarMesmaSenha
      });

      showPageFeedback('Administrador cadastrado com sucesso!');
      dispatch(fetchAdmins());
      resetForm();
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[Admin] Erro ao salvar:', error);
      setIsConfirmModalOpen(false);
      showModalFeedback(
        normalizeAdminSaveError(error.message || 'Erro ao salvar administrador.'),
        'error',
      );
    }
  }

  function triggerDelete(uuid: string) {
    const admin = admins.find(a => a.uuid === uuid);
    if (admin) {
      setAdminToToggle(admin);
      setIsDeleteModalOpen(true);
    }
  }

  async function handleDelete() {
    if (!adminToToggle) return;

    try {
      if (!isAuthenticated || user?.role !== 'admin') {
        showPageFeedback('Você precisa estar autenticado para alterar o status de administradores.', 'error');
        return;
      }

      if (adminToToggle.ativo !== false) {
        await AuthService.inativarAdmin(adminToToggle.uuid);
        showPageFeedback(`Administrador ${adminToToggle.nome} inativado com sucesso.`);
        dispatch(fetchAdmins());
        return;
      }
      
      await AuthService.ativarAdmin(adminToToggle.uuid);
      showPageFeedback(`Administrador ${adminToToggle.nome} ativado com sucesso.`);
      dispatch(fetchAdmins());
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      showPageFeedback(error.message || 'Erro ao alterar status do administrador.', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setAdminToToggle(null);
    }
  }

  return {
    admins,
    isLoading,
    form,
    showForm,
    showPassword,
    setShowPassword,
    editingAdmin,
    pageMessage,
    pageMessageType,
    modalMessage,
    modalMessageType,
    isConfirmModalOpen,
    isDeleteModalOpen,
    adminToToggle,
    setIsConfirmModalOpen,
    setIsDeleteModalOpen,
    startCreate,
    startEdit,
    handleFieldChange,
    triggerSaveConfirm,
    handleSave,
    triggerDelete,
    handleDelete,
    cancelForm: resetForm,
  };
}
