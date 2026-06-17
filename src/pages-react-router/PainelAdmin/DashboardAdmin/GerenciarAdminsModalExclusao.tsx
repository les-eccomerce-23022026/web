import { Modal } from '../../../components/Comum/Modal';
import type { IAdmin } from '../../../interfaces/admin';

type Props = {
  isOpen: boolean;
  adminToToggle: IAdmin | null;
  onClose: () => void;
  onConfirm: () => void;
};

export const GerenciarAdminsModalExclusao = ({
  isOpen,
  adminToToggle,
  onClose,
  onConfirm,
}: Props) => {
  const ativo = adminToToggle?.ativo !== false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ativo ? 'Inativar Administrador' : 'Ativar Administrador'}
      footer={
        <>
          <button className="btn-secondary" data-cy="modal-toggle-admin-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" data-cy="modal-toggle-admin-confirmar" onClick={onConfirm}>
            {ativo ? 'Sim, Inativar' : 'Sim, Ativar'}
          </button>
        </>
      }
    >
      <p>
        Tem certeza que deseja {ativo ? 'inativar' : 'ativar'} o administrador{' '}
        <strong>{adminToToggle?.nome}</strong>?
      </p>
    </Modal>
  );
};
