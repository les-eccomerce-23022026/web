'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { fetchAdmins } from '../../../store/slices/adminSlice';
import { useGerenciarAdmins } from './useGerenciarAdmins';
import styles from './style.module.css';
import { GerenciarAdminsTabela } from './GerenciarAdminsTabela';
import { GerenciarAdminsModalFormulario } from './GerenciarAdminsModalFormulario';
import { GerenciarAdminsModalSalvar } from './GerenciarAdminsModalSalvar';
import { GerenciarAdminsModalExclusao } from './GerenciarAdminsModalExclusao';
import { AdminKPIs } from '../../../components/Admin/AdminKPIs';
import { AdminToolbar } from '../../../components/Admin/AdminToolbar';
import { obterKPIsAdmins } from './kpisAdmins';

function GerenciarAdmins() {
  const dispatch = useAppDispatch();
  const h = useGerenciarAdmins();

  useEffect(() => {
    dispatch(fetchAdmins());
  }, [dispatch]);

  if (h.isLoading) {
    return <div className={styles.pageContent}>Carregando administradores...</div>;
  }

  const kpis = obterKPIsAdmins(h.admins);

  return (
    <div className={styles.pageContent}>
      <div className={`card ${styles.listCardWrapper}`}>
        <AdminKPIs kpis={kpis} columns={4} enableCarousel={true} />

        <AdminToolbar
          placeholderBusca="Buscar por nome ou e-mail..."
          onBusca={h.setFiltroBusca}
          filtros={[
            {
              id: 'status',
              label: 'Status',
              value: h.filtroStatus,
              opcoes: [
                { label: 'Todos os Administradores', value: 'todos' },
                { label: 'Apenas Ativos', value: 'ativo' },
                { label: 'Apenas Inativos', value: 'inativo' },
              ],
            },
          ]}
          onFiltroChange={(id, valor) => {
            if (id === 'status') h.setFiltroStatus(valor as 'todos' | 'ativo' | 'inativo');
          }}
          acoes={[
            {
              label: '+ Novo Administrador',
              onClick: h.startCreate,
              variante: 'primario',
            },
          ]}
        />

        {h.pageMessage && (
          <p
            className={
              h.pageMessageType === 'success' ? styles.adminMessageSuccess : styles.errorMessage
            }
          >
            {h.pageMessage}
          </p>
        )}

        <GerenciarAdminsTabela
          admins={h.adminsFiltrados}
          onEdit={h.startEdit}
          onToggle={h.triggerDelete}
        />
      </div>

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
}

export default GerenciarAdmins;
export { GerenciarAdmins };
