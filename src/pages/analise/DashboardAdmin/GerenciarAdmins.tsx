import { useGerenciarAdmins } from './useGerenciarAdmins';
import styles from './GerenciarAdmins.module.css';
import { Eye, EyeOff } from 'lucide-react';
import { Modal } from '@/components/comum/Modal';

export function GerenciarAdmins() {
  const {
    admins,
    form,
    showForm,
    showPassword,
    setShowPassword,
    editingAdmin,
    message,
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
  } = useGerenciarAdmins();

  return (
    <div className={styles.pageContent}>
      <header className={styles.headerActions}>
        <h3 className={styles.pageTitle}>Gerenciar Administradores</h3>
        <button className="btn-primary" onClick={startCreate}>
          Novo Administrador
        </button>
      </header>

      {message && <p className={styles.adminMessageSuccess}>{message}</p>}

      <div className="card">
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((adm) => (
              <tr key={adm.uuid}>
                <td>{adm.nome}</td>
                <td>{adm.email}</td>
                <td>
                  <div className={styles.tableActions}>
                    <button className="btn-primary" onClick={() => startEdit(adm)}>Editar</button>
                    <button className="btn-secondary" onClick={() => triggerDelete(adm.uuid)}>Excluir</button>
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
          )}
        </div>
      </Modal>

      {/* Modal de Confirmação de Salvamento */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirmar Alterações"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setIsConfirmModalOpen(false)}>Revisar</button>
            <button className="btn-primary" onClick={handleSave}>Confirmar e Salvar</button>
          </>
        }
      >
        <p>Você tem certeza que deseja salvar estas informações para o administrador <strong>{form.nome}</strong>?</p>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Excluir Administrador"
        variant="danger"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
            <button className="btn-primary" style={{ backgroundColor: 'var(--bn-error)' }} onClick={handleDelete}>
              Confirmar Exclusão
            </button>
          </>
        }
      >
        <p>Esta ação não pode ser desfeita. O administrador perderá todo o acesso ao sistema imediatamente.</p>
      </Modal>
    </div>
  );
}
