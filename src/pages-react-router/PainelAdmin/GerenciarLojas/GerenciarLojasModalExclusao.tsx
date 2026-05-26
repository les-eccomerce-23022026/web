import { Modal } from '../../../components/Comum/Modal';
import type { ILoja } from '../../../interfaces/loja';

type Props = {
  isOpen: boolean;
  lojaToToggle: ILoja | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export const GerenciarLojasModalExclusao = ({
  isOpen,
  lojaToToggle,
  onClose,
  onConfirm,
}: Props) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={lojaToToggle?.ativo ? 'Desativar Loja' : 'Ativar Loja'}
    footer={
      <>
        <button className="btn-secondary" onClick={onClose} data-cy="btn-cancelar-exclusao">
          Cancelar
        </button>
        <button
          className={lojaToToggle?.ativo ? 'btn-danger' : 'btn-primary'}
          onClick={onConfirm}
          data-cy="btn-confirmar-exclusao"
        >
          {lojaToToggle?.ativo ? 'Desativar' : 'Ativar'}
        </button>
      </>
    }
  >
    <div className="form-container">
      <p data-cy="exclusao-texto">
        {lojaToToggle?.ativo
          ? `Deseja desativar a loja "${lojaToToggle.nome}"?`
          : `Deseja ativar a loja "${lojaToToggle?.nome}"?`}
      </p>
    </div>
  </Modal>
);
