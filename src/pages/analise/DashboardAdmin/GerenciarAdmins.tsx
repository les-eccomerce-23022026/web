import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchAdmins } from '@/store/slices/adminSlice';
import { useGerenciarAdmins } from './useGerenciarAdmins';
import styles from './GerenciarAdmins.module.css';
import { GerenciarAdminsTabela } from './GerenciarAdminsTabela';
import { GerenciarAdminsModalFormulario } from './GerenciarAdminsModalFormulario';
import { GerenciarAdminsModalSalvar } from './GerenciarAdminsModalSalvar';
import { GerenciarAdminsModalExclusao } from './GerenciarAdminsModalExclusao';

export const GerenciarAdmins = () => {
  const dispatch = useAppDispatch();
  const h = useGerenciarAdmins();

  useEffect(() => {
    dispatch(fetchAdmins());
  }, [dispatch]);

  if (h.isLoading) {
    return <div className={styles.pageContent}>Carregando administradores...</div>;
  }

  return (
    <div className={styles.pageContent}>
      <header className={styles.headerActions}>
        <h3 className={styles.pageTitle}>Gerenciar Administradores</h3>
        <button className="btn-primary" onClick={h.startCreate}>
          Novo Administrador
        </button>
      </header>

      {h.pageMessage && (
        <p
          className={
            h.pageMessageType === 'success' ? styles.adminMessageSuccess : styles.errorMessage
          }
        >
          {h.pageMessage}
        </p>
      )}

      <GerenciarAdminsTabela admins={h.admins} onEdit={h.startEdit} onToggle={h.triggerDelete} />

      <GerenciarAdminsModalFormulario
        isOpen={h.showForm}
        editingAdmin={h.editingAdmin}
        form={h.form}
        showPassword={h.showPassword}
        setShowPassword={h.setShowPassword}
        modalMessage={h.modalMessage}
        modalMessageType={h.modalMessageType}
        isConfirmModalOpen={h.isConfirmModalOpen}
        onClose={h.cancelForm}
        onTriggerSaveConfirm={h.triggerSaveConfirm}
        onFieldChange={h.handleFieldChange}
      />

      <GerenciarAdminsModalSalvar
        isOpen={h.isConfirmModalOpen}
        editingAdmin={h.editingAdmin}
        formNome={h.form.nome}
        modalMessage={h.modalMessage}
        modalMessageType={h.modalMessageType}
        onClose={() => h.setIsConfirmModalOpen(false)}
        onSave={h.handleSave}
      />

      <GerenciarAdminsModalExclusao
        isOpen={h.isDeleteModalOpen}
        adminToToggle={h.adminToToggle}
        onClose={() => h.setIsDeleteModalOpen(false)}
        onConfirm={h.handleDelete}
      />
    </div>
  );
};
