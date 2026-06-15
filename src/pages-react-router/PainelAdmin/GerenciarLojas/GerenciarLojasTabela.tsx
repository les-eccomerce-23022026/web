import styles from './style.module.css';
import type { ILoja } from '../../../interfaces/loja';
import { formatarCnpj } from '../../../utils/formatters';

interface IGerenciarLojasTabelaProps {
  lojas: ILoja[];
  isLoading: boolean;
  onEdit: (loja: ILoja) => void;
  onToggle: (uuid: string) => void;
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map((col) => (
        <td key={col}>
          <div className={styles.skeletonCell} />
        </td>
      ))}
    </tr>
  );
}

export const GerenciarLojasTabela = ({
  lojas,
  isLoading,
  onEdit,
  onToggle,
}: IGerenciarLojasTabelaProps) => {
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
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : lojas.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>📦</div>
                  <p>Nenhuma loja encontrada</p>
                </div>
              </td>
            </tr>
          ) : (
            lojas.map((loja) => (
              <tr key={loja.uuid} data-cy={`loja-row-${loja.uuid}`}>
                <td data-cy={`loja-nome-${loja.uuid}`}>{loja.nome}</td>
                <td data-cy={`loja-slug-${loja.uuid}`}>{loja.slug}</td>
                <td data-cy={`loja-cnpj-${loja.uuid}`}>{formatarCnpj(loja.cnpj)}</td>
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
                      className={loja.ativo ? 'btn-danger' : 'btn-primary'}
                      onClick={() => onToggle(loja.uuid)}
                      data-cy={`btn-excluir-loja-${loja.uuid}`}
                    >
                      {loja.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
