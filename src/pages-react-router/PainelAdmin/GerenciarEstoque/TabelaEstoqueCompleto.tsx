'use client';

import { AdminTable } from '@/components/Admin/AdminTable';
import { Package } from 'lucide-react';
import type { IItemEstoque } from '@/services/contracts/estoqueService';

interface ITabelaEstoqueCompletoProps {
  dados: IItemEstoque[];
  paginaAtual: number;
  itensPorPagina: number;
  aoMudarPagina: (pagina: number) => void;
}

export function TabelaEstoqueCompleto({
  dados,
  paginaAtual,
  itensPorPagina,
  aoMudarPagina,
}: ITabelaEstoqueCompletoProps) {
  const dadosPaginados = dados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

  return (
    <AdminTable
      colunas={[
        { key: 'livroTitulo', label: 'Livro' },
        { key: 'livroIsbn', label: 'ISBN' },
        { key: 'quantidadeDisponivel', label: 'Qtd. Disponível' },
        { key: 'quantidadeReservada', label: 'Qtd. Reservada' },
        {
          key: 'precoVenda',
          label: 'Preço Venda',
          render: (valor: number) => `R$ ${valor.toFixed(2)}`,
        },
        {
          key: 'valorCustoAtual',
          label: 'Custo Atual',
          render: (valor: number) => `R$ ${valor.toFixed(2)}`,
        },
      ]}
      dados={dadosPaginados}
      rowKey="uuid"
      estadoVazio={{
        titulo: 'Nenhum item no estoque',
        mensagem: 'Não há livros cadastrados no estoque no momento. Registre uma entrada para começar.',
        icone: <Package size={48} strokeWidth={1.5} />,
      }}
      paginacao={{
        paginaAtual,
        totalPaginas: Math.ceil(dados.length / itensPorPagina),
        aoMudarPagina,
      }}
    />
  );
}
