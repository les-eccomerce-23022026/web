'use client';

import { AdminTable } from '@/components/Admin/AdminTable';
import type { IItemEstoque } from '@/services/contracts/estoqueService';

interface ITabelaEstoqueCriticoProps {
  dados: IItemEstoque[];
}

export function TabelaEstoqueCritico({ dados }: ITabelaEstoqueCriticoProps) {
  return (
    <AdminTable
      colunas={[
        { key: 'livroTitulo', label: 'Livro' },
        { key: 'livroIsbn', label: 'ISBN' },
        {
          key: 'quantidadeDisponivel',
          label: 'Qtd. Disponível',
          render: (valor: number) => <span className="font-bold text-red-600">{valor}</span>,
        },
        {
          key: 'precoVenda',
          label: 'Preço Venda',
          render: (valor: number) => `R$ ${valor.toFixed(2)}`,
        },
      ]}
      dados={dados}
      rowKey="uuid"
    />
  );
}
