import { Modal } from '@/components/comum/Modal';
import styles from './GerenciarAdmins.module.css';
import { GerenciarAdminsFormNovoAdminCampos } from './GerenciarAdminsFormNovoAdminCampos';
import type { IAdmin } from '@/interfaces/IAdmin';
import type { IAdminFormState } from '@/interfaces/IAdmin';

type Props = {
  isOpen: boolean;
  editingAdmin: IAdmin | null;
  form: IAdminFormState;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  modalMessage: string;
  modalMessageType: 'success' | 'error';
  isConfirmModalOpen: boolean;
  onClose: () => void;
  onTriggerSaveConfirm: () => void;
  onFieldChange: (field: keyof IAdminFormState, value: string | boolean) => void;
};

export const GerenciarAdminsModalFormulario = ({
  isOpen,
  editingAdmin,
  form,
  showPassword,
  setShowPassword,
  modalMessage,
  modalMessageType,
  isConfirmModalOpen,
  onClose,
  onTriggerSaveConfirm,
  onFieldChange,
}: Props) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={editingAdmin ? 'Editar Administrador' : 'Novo Administrador'}
    footer={
      <>
        <button className="btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn-primary" onClick={onTriggerSaveConfirm}>
          {editingAdmin ? 'Atualizar Dados' : 'Criar Administrador'}
        </button>
      </>
    }
  >
    <div className="form-container">
      {modalMessage && !isConfirmModalOpen && (
        <p
          className={
            modalMessageType === 'success' ? styles.adminMessageSuccess : styles.errorMessage
          }
        >
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
          onChange={(e) => onFieldChange('nome', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>E-mail Corporativo</label>
        <input
          name="email"
          type="email"
          placeholder="adm@empresa.com"
          value={form.email}
          onChange={(e) => onFieldChange('email', e.target.value)}
        />
      </div>

      {!editingAdmin && (
        <GerenciarAdminsFormNovoAdminCampos
          form={form}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          onFieldChange={onFieldChange}
        />
      )}
    </div>
  </Modal>
);
