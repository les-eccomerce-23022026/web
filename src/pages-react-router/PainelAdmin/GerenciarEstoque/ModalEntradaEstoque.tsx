'use client';

interface IModalEntradaEstoqueProps {
  mostrar: boolean;
  formulario: {
    livroUuid: string;
    quantidade: string;
    custoUnitario: string;
    fornecedorUuid: string;
    numeroNotaFiscal: string;
    observacoes: string;
  };
  erro: string | null;
  enviando: boolean;
  aoFechar: () => void;
  aoSalvar: (e: React.FormEvent) => void;
  aoAlterarCampo: (campo: string, valor: string) => void;
}

export function ModalEntradaEstoque({
  mostrar,
  formulario,
  erro,
  enviando,
  aoFechar,
  aoSalvar,
  aoAlterarCampo,
}: IModalEntradaEstoqueProps) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Registrar Entrada de Estoque</h2>

        {erro && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{erro}</p>
          </div>
        )}

        <form onSubmit={aoSalvar}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">UUID do Livro</label>
            <input
              type="text"
              value={formulario.livroUuid}
              onChange={(e) => aoAlterarCampo('livroUuid', e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Quantidade</label>
            <input
              type="number"
              value={formulario.quantidade}
              onChange={(e) => aoAlterarCampo('quantidade', e.target.value)}
              className="w-full border rounded px-3 py-2"
              min="1"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Custo Unitário</label>
            <input
              type="number"
              step="0.01"
              value={formulario.custoUnitario}
              onChange={(e) => aoAlterarCampo('custoUnitario', e.target.value)}
              className="w-full border rounded px-3 py-2"
              min="0.01"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">UUID do Fornecedor (opcional)</label>
            <input
              type="text"
              value={formulario.fornecedorUuid}
              onChange={(e) => aoAlterarCampo('fornecedorUuid', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Nota Fiscal (opcional)</label>
            <input
              type="text"
              value={formulario.numeroNotaFiscal}
              onChange={(e) => aoAlterarCampo('numeroNotaFiscal', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
            <textarea
              value={formulario.observacoes}
              onChange={(e) => aoAlterarCampo('observacoes', e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={aoFechar}
              className="px-4 py-2 border rounded hover:bg-gray-100"
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={enviando}
            >
              {enviando ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
