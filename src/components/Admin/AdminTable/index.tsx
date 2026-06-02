'use client';

import { LoadingState } from '@/components/Comum/LoadingState/LoadingState';
import { ErrorState } from '@/components/Comum/ErrorState/ErrorState';
import { EmptyState } from '@/components/Comum/EmptyState/EmptyState';
import { Paginacao } from '@/components/Comum/Paginacao/Paginacao';
import styles from './adminTable.module.css';
import type { IAdminTableProps } from './types';

export function AdminTable<T extends Record<string, any>>({
  colunas,
  dados,
  rowKey,
  aoClicarLinha,
  carregando = false,
  erro,
  aoTentarNovamente,
  estadoVazio,
  paginacao,
  className = '',
}: IAdminTableProps<T>) {
  if (carregando) {
    return <LoadingState message="Carregando dados..." className={className} />;
  }

  if (erro) {
    return (
      <ErrorState
        title="Erro ao carregar dados"
        message={erro}
        onRetry={aoTentarNovamente}
        className={className}
      />
    );
  }

  if (dados.length === 0) {
    return (
      <EmptyState
        title={estadoVazio?.titulo || 'Nenhum resultado'}
        message={estadoVazio?.mensagem || 'Não encontramos dados para exibir.'}
        icon={estadoVazio?.icone}
        className={className}
      />
    );
  }

  const obterClasseAlinhamento = (alinhamento?: string) => {
    if (alinhamento === 'center') return styles.alinhamentoCenter;
    if (alinhamento === 'right') return styles.alinhamentoRight;
    return '';
  };

  return (
    <div className={className}>
      <div className={styles.adminTableWrapper}>
        <table className={styles.adminTable}>
          <thead className={styles.adminTableCabecalho}>
            <tr>
              {colunas.map((coluna) => (
                <th
                  key={coluna.key}
                  className={obterClasseAlinhamento(coluna.alinhamento)}
                >
                  {coluna.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dados.map((linha) => (
              <tr
                key={linha[rowKey]}
                data-cy={rowKey ? `admin-pedido-${linha[rowKey]}` : undefined}
                className={`${styles.adminTableLinha} ${
                  aoClicarLinha ? styles.adminTableLinhaClicavel : ''
                }`}
                onClick={() => aoClicarLinha?.(linha)}
              >
                {colunas.map((coluna) => (
                  <td
                    key={coluna.key}
                    className={`${styles.adminTableCelula} ${obterClasseAlinhamento(
                      coluna.alinhamento
                    )}`}
                    data-label={coluna.label}
                  >
                    {coluna.render
                      ? coluna.render(linha[coluna.key], linha)
                      : linha[coluna.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginacao && paginacao.totalPaginas > 1 && (
        <div className={styles.adminTablePaginacaoWrapper}>
          <Paginacao
            paginaAtual={paginacao.paginaAtual}
            totalPaginas={paginacao.totalPaginas}
            onPaginaAnterior={() =>
              paginacao.aoMudarPagina(paginacao.paginaAtual - 1)
            }
            onProximaPagina={() =>
              paginacao.aoMudarPagina(paginacao.paginaAtual + 1)
            }
          />
        </div>
      )}
    </div>
  );
}
