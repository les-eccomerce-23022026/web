import type { IColuna } from '../../../components/Admin/AdminTable/types';
import type { ILivro } from '../../../interfaces/livro';
import { LIMITE_ESTOQUE_CRITICO } from '@/config/constantesNegocio';
import styles from './style.module.css';

export function obterColunasTabelaLivros(
  onEditar: (uuid: string) => void,
  onTrocarStatus: (uuid: string) => void,
): IColuna<ILivro>[] {
  return [
    {
      key: 'titulo',
      label: 'Título e Autor',
      render: (_: string, livro: ILivro) => (
        <div className={styles.livroInfoCell}>
          <strong>{livro.titulo}</strong>
          <span>{livro.autor}</span>
        </div>
      ),
    },
    { key: 'isbn', label: 'ISBN' },
    {
      key: 'estoque',
      label: 'Estoque',
      render: (estoque: number) => (
        <span className={estoque <= LIMITE_ESTOQUE_CRITICO ? styles.estoqueBadgeCritico : styles.estoqueBadge}>
          {estoque} un
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => (
        <span className={status === 'Ativo' ? styles.listaLivrosStatusActive : styles.listaLivrosStatusInactive}>
          {status}
        </span>
      ),
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (_: string, livro: ILivro) => (
        <div className={styles.flexActions}>
          <button
            data-cy="btn-editar-livro"
            className={`${styles.btnActionAdmin} ${styles.edit}`}
            title="Editar informações"
            onClick={() => onEditar(livro.uuid)}
          >
            Editar
          </button>
          <button
            onClick={() => onTrocarStatus(livro.uuid)}
            className={`${styles.btnActionAdmin} ${livro.status === 'Ativo' ? styles.inactivate : styles.activate}`}
          >
            {livro.status === 'Ativo' ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      ),
    },
  ];
}
