import { useGerenciarAdmins } from './useGerenciarAdmins';
import styles from './GerenciarAdmins.module.css';
import { Eye, EyeOff } from 'lucide-react';
import { Modal } from '@/components/comum/Modal';
import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchAdmins } from '@/store/slices/adminSlice';

export function GerenciarAdmins() {
  const dispatch = useAppDispatch();
  const {
    admins,
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
    startCreate,
    startEdit,
    handleFieldChange,
    triggerSaveConfirm,
    handleSave,
    triggerDelete,
    handleDelete,
    cancelForm,
    setIsConfirmModalOpen,
    setIsDeleteModalOpen,
    adminToToggle,
    isLoading,
  } = useGerenciarAdmins();

  useEffect(() => {
    dispatch(fetchAdmins());
  }, [dispatch]);

  if (isLoading) {
    return <div className={styles.pageContent}>Carregando administradores...</div>;
  }

  return (
    <div className={styles.pageContent}>
      <header className={styles.headerActions}>
        <h3 className={styles.pageTitle}>Gerenciar Administradores</h3>
        <button className="btn-primary" onClick={startCreate}>
          Novo Administrador
        </button>
      </header>

      {pageMessage && (
        <p className={pageMessageType === 'success' ? styles.adminMessageSuccess : styles.errorMessage}>
          {pageMessage}
        </p>
      )}

      <div className="card">
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((adm) => (
              <tr key={adm.uuid}>
                <td>{adm.nome}</td>
                <td>{adm.email}</td>
                <td>
                  <span className={adm.ativo !== false ? styles.statusAtivo : styles.statusInativo}>
                    {adm.ativo !== false ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>
                  <div className={styles.tableActions}>
                    <button className="btn-primary" onClick={() => startEdit(adm)}>Editar</button>
                    <button 
                      className={adm.ativo !== false ? 'btn-secondary' : 'btn-primary'} 
                      onClick={() => triggerDelete(adm.uuid)}
                    >
                      {adm.ativo !== false ? 'Inativar' : 'Ativar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro/Edição */}
      <Modal
        isOpen={showForm}
        onClose={cancelForm}
        title={editingAdmin ? 'Editar Administrador' : 'Novo Administrador'}
        footer={
          <>
            <button className="btn-secondary" onClick={cancelForm}>Cancelar</button>
            <button className="btn-primary" onClick={triggerSaveConfirm}>
              {editingAdmin ? 'Atualizar Dados' : 'Criar Administrador'}
            </button>
          </>
        }
      >
        <div className="form-container">
          {modalMessage && !isConfirmModalOpen && (
            <p className={modalMessageType === 'success' ? styles.adminMessageSuccess : styles.errorMessage}>
              {modalMessage}
            </p>
          )}

          <div className="form-group">
            <label>Nome Completo</label>
            <input
              name="nome"
              type="text"
              placeholder="Ex: João Silva"
              value={form.nome}
              onChange={(e) => handleFieldChange('nome', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>E-mail Corporativo</label>
            <input
              name="email"
              type="email"
              placeholder="adm@empresa.com"
              value={form.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
            />
          </div>

          {!editingAdmin && (
            <>
              <div className="form-group">
                <label>CPF</label>
                <input
                  name="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(e) => handleFieldChange('cpf', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <input
                  id="usarMesmaSenha"
                  name="usarMesmaSenha"
                  type="checkbox"
                  checked={form.usarMesmaSenha}
                  onChange={(e) => handleFieldChange('usarMesmaSenha', e.target.checked)}
                />
                <label htmlFor="usarMesmaSenha" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Usar mesma senha se já for cliente
                </label>
              </div>

              {!form.usarMesmaSenha && (
                <>
                  <div className="form-group">
                    <label>Senha Provisória</label>
                    <div className={styles.passwordWrapper}>
                      <input
                        name="senha"
                        type={showPassword ? 'text' : 'password'}
                        className={styles.passwordInput}
                        value={form.senha}
                        onChange={(e) => handleFieldChange('senha', e.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirmar Senha</label>
                    <div className={styles.passwordWrapper}>
                      <input
                        name="confirmacaoSenha"
                        type={showPassword ? 'text' : 'password'}
                        className={styles.passwordInput}
                        value={form.confirmacaoSenha}
                        onChange={(e) => handleFieldChange('confirmacaoSenha', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Modal de Confirmação de Salvamento */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={editingAdmin ? 'Confirmar Atualização' : 'Confirmar Criação'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setIsConfirmModalOpen(false)}>Revisar</button>
            <button className="btn-primary" onClick={handleSave}>
              {editingAdmin ? 'Confirmar Atualização' : 'Confirmar Criação'}
            </button>
          </>
        }
      >
        {modalMessage && isConfirmModalOpen && (
          <p className={modalMessageType === 'success' ? styles.adminMessageSuccess : styles.errorMessage}>
            {modalMessage}
          </p>
        )}

        <p>
          {editingAdmin
            ? (
              <>
                Você tem certeza que deseja atualizar as informações do administrador <strong>{form.nome}</strong>?
              </>
              )
            : (
              <>
                Você tem certeza que deseja criar o administrador <strong>{form.nome}</strong>?
              </>
              )}
        </p>
      </Modal>

      {/* Modal de Confirmação de Exclusão (Inativação/Ativação) */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={adminToToggle?.ativo !== false ? 'Inativar Administrador' : 'Ativar Administrador'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleDelete}>
              {adminToToggle?.ativo !== false ? 'Sim, Inativar' : 'Sim, Ativar'}
            </button>
          </>
        }
      >
        <p>
          Tem certeza que deseja {adminToToggle?.ativo !== false ? 'inativar' : 'ativar'} o administrador <strong>{adminToToggle?.nome}</strong>?
        </p>
      </Modal>
    </div>
  );
}
