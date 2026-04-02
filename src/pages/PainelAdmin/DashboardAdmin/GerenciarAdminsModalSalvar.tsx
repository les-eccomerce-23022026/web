import { Modal } from '@/components/Comum/Modal';
import styles from './GerenciarAdmins.module.css';
import type { IAdmin } from '@/interfaces/admin';

type Props = {
  isOpen: boolean;
  editingAdmin: IAdmin | null;
  formNome: string;
  modalMessage: string;
  modalMessageType: 'success' | 'error';
  onClose: () => void;
  onSave: () => void;
};

export const GerenciarAdminsModalSalvar = ({
  isOpen,
  editingAdmin,
  formNome,
  modalMessage,
  modalMessageType,
  onClose,
  onSave,
}: Props) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={editingAdmin ? 'Confirmar Atualização' : 'Confirmar Criação'}
    footer={
      <>
        <button className="btn-secondary" onClick={onClose}>
          Revisar
        </button>
        <button className="btn-primary" onClick={onSave}>
          {editingAdmin ? 'Confirmar Atualização' : 'Confirmar Criação'}
        </button>
      </>
    }
  >
    {modalMessage && isOpen && (
      <p
        className={
          modalMessageType === 'success' ? styles.adminMessageSuccess : styles.errorMessage
        }
      >
        {modalMessage}
      </p>
    )}

    <p>
      {editingAdmin ? (
        <>
          Você tem certeza que deseja atualizar as informações do administrador{' '}
          <strong>{formNome}</strong>?
        </>
      ) : (
        <>
          Você tem certeza que deseja criar o administrador <strong>{formNome}</strong>?
        </>
      )}
    </p>
  </Modal>
);
