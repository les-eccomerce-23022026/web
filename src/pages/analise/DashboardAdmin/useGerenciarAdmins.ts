import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import type { IAdmin, IAdminFormState } from '@/interfaces/IAdmin';
import {
  addAdmin,
  updateAdmin,
  deleteAdmin as deleteAdminAction,
}  from '@/store/slices/adminSlice';

const INITIAL_FORM: IAdminFormState = { nome: '', email: '', senha: '' };

export function useGerenciarAdmins() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { admins } = useAppSelector((state) => state.admin);

  const [editingAdmin, setEditingAdmin] = useState<IAdmin | null>(null);
  const [form, setForm] = useState<IAdminFormState>(INITIAL_FORM);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null);

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingAdmin(null);
    setShowForm(false);
    setIsConfirmModalOpen(false);
  }

  function startCreate() {
    setEditingAdmin(null);
    setForm(INITIAL_FORM);
    setShowForm(true);
  }

  function startEdit(admin: IAdmin) {
    setEditingAdmin(admin);
    setForm({ nome: admin.nome, email: admin.email, senha: '' });
    setShowForm(true);
  }

  function handleFieldChange(field: keyof IAdminFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function triggerSaveConfirm() {
    if (!token) {
      setMessage('Você precisa estar autenticado para gerenciar administradores.');
      return;
    }
    setIsConfirmModalOpen(true);
  }

  function handleSave() {
    if (editingAdmin) {
      dispatch(
        updateAdmin({
          ...editingAdmin,
          nome: form.nome,
          email: form.email,
        }),
      );
      setMessage('Administrador atualizado com sucesso.');
      resetForm();
      return;
    }

    const newAdmin: IAdmin = {
      uuid: `uuid-admin-${Date.now()}`,
      nome: form.nome,
      email: form.email,
      role: 'admin',
    };

    dispatch(addAdmin(newAdmin));
    setMessage('Administrador cadastrado com sucesso.');
    resetForm();
  }

  function triggerDelete(uuid: string) {
    setAdminToDelete(uuid);
    setIsDeleteModalOpen(true);
  }

  function handleDelete() {
    if (adminToDelete) {
      dispatch(deleteAdminAction(adminToDelete));
      setMessage('Administrador removido com sucesso.');
      setIsDeleteModalOpen(false);
      setAdminToDelete(null);
    }
  }

  return {
    admins,
    form,
    showForm,
    showPassword,
    setShowPassword,
    editingAdmin,
    message,
    isConfirmModalOpen,
    isDeleteModalOpen,
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
