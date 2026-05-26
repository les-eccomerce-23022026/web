import { Modal } from '../../../components/Comum/Modal';
import styles from './style.module.css';
import type { ILoja } from '../../../interfaces/loja';

type Props = {
  isOpen: boolean;
  editingLoja: ILoja | null;
  formNome: string;
  modalMessage: string;
  modalMessageType: 'success' | 'error';
  onClose: () => void;
  onSave: () => Promise<void>;
};

export const GerenciarLojasModalSalvar = ({
  isOpen,
  editingLoja,
  formNome,
  modalMessage,
  modalMessageType,
  onClose,
  onSave,
}: Props) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={editingLoja ? 'Confirmar Atualização' : 'Confirmar Criação'}
    footer={
      <>
        <button className="btn-secondary" onClick={onClose} data-cy="btn-cancelar-confirmacao">
          Cancelar
        </button>
        <button className="btn-primary" onClick={onSave} data-cy="btn-confirmar-salvar">
          Confirmar
        </button>
      </>
    }
  >
    <div className="form-container">
      {/* Mensagem de erro */}
      {modalMessage && (
        <p
          className={
            modalMessageType === 'success' ? styles.messageSuccess : styles.errorMessage
          }
          data-cy="confirmacao-message"
        >
          {modalMessage}
        </p>
      )}

      {/* Mensagem de confirmação */}
      <p data-cy="confirmacao-texto">
        {editingLoja
          ? `Deseja atualizar a loja "${formNome}"?`
          : `Deseja criar a loja "${formNome}"?`}
      </p>
    </div>
  </Modal>
);
