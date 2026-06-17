import { useMemo } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store';
import type { ILivro } from '@/interfaces/livro';
import { DollarSign, Percent, Package, BookOpen } from 'lucide-react';
import type { ItemKPI } from '@/components/Admin/AdminKPIs/types';

interface UseDashboardKPIsParams {
  totalVendasMes: number;
  percentualCrescimento: number;
  ticketMedio: number;
  livrosBaixoEstoque: number;
}

/** Referência estável para o caso "sem livros", evitando novo array a cada render. */
const LIVROS_VAZIO: ILivro[] = [];

function isLivroArray(value: unknown): value is ILivro[] {
  return Array.isArray(value) && value.length > 0 &&
    typeof value[0] === 'object' && value[0] !== null &&
    'uuid' in value[0] && 'estoque' in value[0];
}

/**
 * Selector memoizado: só recalcula quando `state.livro.livrosAdmin` muda de
 * referência. Sem isto, o selector inline retornava um novo array a cada
 * chamada, disparando rerenders desnecessários no dashboard.
 */
const selectLivrosAdmin = createSelector(
  [(state: RootState) => (state.livro as { livrosAdmin?: unknown } | undefined)?.livrosAdmin],
  (livrosAdmin): ILivro[] => (isLivroArray(livrosAdmin) ? livrosAdmin : LIVROS_VAZIO),
);

export function useDashboardKPIs({ totalVendasMes, percentualCrescimento, ticketMedio, livrosBaixoEstoque }: UseDashboardKPIsParams) {
  const livros = useAppSelector(selectLivrosAdmin);

  const totalLivros = livros.length;

  // Card de administradores removido: apenas PAPEL_ADMIN_SISTEMA pode listar admins
  // Admins de loja recebem erro 403 ao tentar acessar /api/admin/administradores
  // TODO: Se necessário, implementar endpoint específico para contar admins na resposta do dashboard

  return useMemo<ItemKPI[]>(() => [
    {
      id: 'receita-mes',
      label: 'Receita do Mês',
      value: `R$ ${totalVendasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      variant: 'receita',
      trend: { valor: percentualCrescimento },
    },
    {
      id: 'ticket-medio',
      label: 'Ticket Médio',
      value: `R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: Percent,
      variant: 'default',
    },
    {
      id: 'livros-catalogo',
      label: 'Livros no Catálogo',
      value: totalLivros,
      icon: BookOpen,
      variant: 'default',
    },
    {
      id: 'estoque-critico',
      label: 'Estoque Crítico (≤ 5)',
      value: livrosBaixoEstoque,
      icon: Package,
      variant: 'critico',
    },
  ], [totalVendasMes, percentualCrescimento, ticketMedio, totalLivros, livrosBaixoEstoque]);
}
