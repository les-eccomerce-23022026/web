'use client';

import { Modal } from '@/components/Comum/Modal';
import type { IItemEstoque } from '@/services/contracts/estoqueService';

interface IModalEdicaoEstoqueProps {
  mostrar: boolean;
  estoque: IItemEstoque | null;
  formulario: {
    quantidadeDisponivel: string;
    precoVenda: string;
    valorCustoAtual: string;
  };
  erro: string | null;
  enviando: boolean;
  aoFechar: () => void;
  aoSalvar: (e: React.FormEvent) => void;
  aoAlterarCampo: (campo: string, valor: string) => void;
}

export function ModalEdicaoEstoque({
  mostrar,
  estoque,
  formulario,
  erro,
  enviando,
  aoFechar,
  aoSalvar,
  aoAlterarCampo,
}: IModalEdicaoEstoqueProps) {
  if (!estoque) return null;

  return (
    <Modal
      isOpen={mostrar}
      onClose={aoFechar}
      title="Editar Estoque"
      footer={
        <>
          <button
            type="button"
            onClick={aoFechar}
            className="btn-secondary"
            disabled={enviando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-edicao-estoque"
            className="btn-primary"
            disabled={enviando}
          >
            {enviando ? 'Salvando...' : 'Salvar'}
          </button>
        </>
      }
    >
      {erro && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{erro}</p>
        </div>
      )}

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700">{estoque.livroTitulo}</p>
        <p className="text-xs text-gray-500">ISBN: {estoque.livroIsbn}</p>
      </div>

      <form id="form-edicao-estoque" onSubmit={aoSalvar}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Quantidade Disponível</label>
          <input
            type="number"
            value={formulario.quantidadeDisponivel}
            onChange={(e) => aoAlterarCampo('quantidadeDisponivel', e.target.value)}
            className="w-full border rounded px-3 py-2"
            min="0"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Preço de Venda (R$)</label>
          <input
            type="number"
            step="0.01"
            value={formulario.precoVenda}
            onChange={(e) => aoAlterarCampo('precoVenda', e.target.value)}
            className="w-full border rounded px-3 py-2"
            min="0.01"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Valor de Custo Atual (R$)</label>
          <input
            type="number"
            step="0.01"
            value={formulario.valorCustoAtual}
            onChange={(e) => aoAlterarCampo('valorCustoAtual', e.target.value)}
            className="w-full border rounded px-3 py-2"
            min="0"
          />
        </div>
      </form>
    </Modal>
  );
}
