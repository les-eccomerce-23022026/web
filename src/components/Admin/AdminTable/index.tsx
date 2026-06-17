'use client';

import { useState } from 'react';
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
  filtrosColuna = [],
  onFiltroColunaChange,
  className = '',
}: IAdminTableProps<T>) {
  const [filtrosLocais, setFiltrosLocais] = useState<Record<string, string>>(() => {
    const inicial: Record<string, string> = {};
    filtrosColuna.forEach((f) => {
      inicial[f.key] = f.valor;
    });
    return inicial;
  });

  const handleFiltroChange = (key: string, valor: string) => {
    setFiltrosLocais((prev) => ({ ...prev, [key]: valor }));
    onFiltroColunaChange?.(key, valor);
  };

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

  const mostrarEstadoVazio = dados.length === 0;

  const obterClasseAlinhamento = (alinhamento?: string) => {
    if (alinhamento === 'center') return styles.alinhamentoCenter;
    if (alinhamento === 'right') return styles.alinhamentoRight;
    return '';
  };

  return (
    <div className={className}>
      <div className={styles.adminTableWrapper} data-cy="admin-table">
        <table className={styles.adminTable} data-cy="admin-pedidos-tabela">
          <thead className={styles.adminTableCabecalho}>
            <tr>
              {colunas.map((coluna) => (
                <th
                  key={coluna.key}
                  className={obterClasseAlinhamento(coluna.alinhamento)}
                >
                  <div className={styles.colunaHeader}>
                    <span className={styles.colunaLabel}>{coluna.label}</span>
                    {coluna.filterable && (
                      <input
                        type="text"
                        placeholder={`Filtrar ${coluna.label.toLowerCase()}...`}
                        value={filtrosLocais[coluna.key] || ''}
                        onChange={(e) => handleFiltroChange(coluna.key, e.target.value)}
                        className={styles.filtroInput}
                        data-cy={`filtro-${coluna.key}`}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mostrarEstadoVazio ? (
              <tr>
                <td colSpan={colunas.length} className={styles.adminTableCelulaVazia}>
                  <EmptyState
                    title={estadoVazio?.titulo || 'Nenhum resultado'}
                    message={estadoVazio?.mensagem || 'Não encontramos dados para exibir.'}
                    icon={estadoVazio?.icone}
                    className={styles.emptyStateInline}
                  />
                </td>
              </tr>
            ) : (
              dados.map((linha) => (
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
              ))
            )}
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
