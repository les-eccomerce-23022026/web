import styles from './style.module.css';
import type { IAdmin } from '../../../interfaces/admin';

type Props = {
  adm: IAdmin;
  onEdit: (adm: IAdmin) => void;
  onToggle: (uuid: string) => void;
};

export const GerenciarAdminRow = ({ adm, onEdit, onToggle }: Props) => {
  const ativo = adm.ativo !== false;

  return (
    <tr>
      <td>{adm.nome}</td>
      <td>{adm.email}</td>
      <td>
        <span className={ativo ? styles.statusAtivo : styles.statusInativo}>
          {ativo ? 'Ativo' : 'Inativo'}
        </span>
      </td>
      <td>
        {adm.trocasPendentes !== undefined && adm.trocasPendentes > 0 ? (
          <span className={styles.trocasPendentes}>
            {adm.trocasPendentes} troca{adm.trocasPendentes > 1 ? 's' : ''} pendente{adm.trocasPendentes > 1 ? 's' : ''}
          </span>
        ) : (
          <span className={styles.semTrocas}>—</span>
        )}
      </td>
      <td>
        <div className={styles.tableActions}>
          <button className="btn-primary" onClick={() => onEdit(adm)}>
            Editar
          </button>
          <button
            className={ativo ? 'btn-secondary' : 'btn-primary'}
            onClick={() => onToggle(adm.uuid)}
          >
            {ativo ? 'Inativar' : 'Ativar'}
          </button>
        </div>
      </td>
    </tr>
  );
};
