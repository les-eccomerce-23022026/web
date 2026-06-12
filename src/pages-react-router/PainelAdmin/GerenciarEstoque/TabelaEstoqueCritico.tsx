'use client';

import { AdminTable } from '@/components/Admin/AdminTable';
import type { IItemEstoque } from '@/services/contracts/estoqueService';
import { Edit } from 'lucide-react';

interface ITabelaEstoqueCriticoProps {
  dados: IItemEstoque[];
  aoEditarEstoque: (estoque: IItemEstoque) => void;
}

export function TabelaEstoqueCritico({ dados, aoEditarEstoque }: ITabelaEstoqueCriticoProps) {
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
        {
          key: 'acoes',
          label: 'Ações',
          render: (_: any, linha: IItemEstoque) => (
            <button
              onClick={() => aoEditarEstoque(linha)}
              className="btn-secondary btn-sm"
              title="Editar estoque"
            >
              <Edit size={16} />
            </button>
          ),
        },
      ]}
      dados={dados}
      rowKey="uuid"
    />
  );
}
