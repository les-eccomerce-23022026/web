import styles from './style.module.css';
import type { ILoja } from '../../../interfaces/loja';

type Props = {
  lojas: ILoja[];
  onEdit: (loja: ILoja) => void;
  onToggle: (uuid: string) => void;
};

export const GerenciarLojasTabela = ({ lojas, onEdit, onToggle }: Props) => {
  // Renderizar estado vazio
  if (lojas.length === 0) {
    return (
      <div className="card">
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📦</div>
          <p>Nenhuma loja encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <table className={styles.lojaTable}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Slug</th>
            <th>CNPJ</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {lojas.map((loja) => (
            <tr key={loja.uuid} data-cy={`loja-row-${loja.uuid}`}>
              <td data-cy={`loja-nome-${loja.uuid}`}>{loja.nome}</td>
              <td data-cy={`loja-slug-${loja.uuid}`}>{loja.slug}</td>
              <td data-cy={`loja-cnpj-${loja.uuid}`}>{loja.cnpj}</td>
              <td>
                <span
                  className={loja.ativo ? styles.statusAtivo : styles.statusInativo}
                  data-cy={`loja-status-${loja.uuid}`}
                >
                  {loja.ativo ? 'Ativa' : 'Inativa'}
                </span>
              </td>
              <td>
                <div className={styles.tableActions}>
                  <button
                    className="btn-secondary"
                    onClick={() => onEdit(loja)}
                    data-cy={`btn-editar-loja-${loja.uuid}`}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => onToggle(loja.uuid)}
                    data-cy={`btn-excluir-loja-${loja.uuid}`}
                  >
                    {loja.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
