import styles from './GerenciarAdmins.module.css';
import { GerenciarAdminRow } from './GerenciarAdminRow';
import type { IAdmin } from '@/interfaces/IAdmin';

type Props = {
  admins: IAdmin[];
  onEdit: (adm: IAdmin) => void;
  onToggle: (uuid: string) => void;
};

export const GerenciarAdminsTabela = ({ admins, onEdit, onToggle }: Props) => (
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
          <GerenciarAdminRow key={adm.uuid} adm={adm} onEdit={onEdit} onToggle={onToggle} />
        ))}
      </tbody>
    </table>
  </div>
);
