'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { estoqueServiceApi } from '@/services/api/estoqueServiceApi';
import { IItemEstoque, IKpisEstoque } from '@/services/contracts/estoqueService';

export default function GerenciarEstoque() {
  const router = useRouter();
  const [estoque, setEstoque] = useState<IItemEstoque[]>([]);
  const [estoqueCritico, setEstoqueCritico] = useState<IItemEstoque[]>([]);
  const [kpis, setKpis] = useState<IKpisEstoque | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mostrarModalEntrada, setMostrarModalEntrada] = useState(false);
  const [formularioEntrada, setFormularioEntrada] = useState({
    livroUuid: '',
    quantidade: '',
    custoUnitario: '',
    fornecedorUuid: '',
    numeroNotaFiscal: '',
    observacoes: '',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [dadosEstoque, dadosCritico, dadosKpis] = await Promise.all([
        estoqueServiceApi.listarEstoque(),
        estoqueServiceApi.listarEstoqueCritico(5),
        estoqueServiceApi.obterKpis(5),
      ]);
      setEstoque(dadosEstoque);
      setEstoqueCritico(dadosCritico);
      setKpis(dadosKpis);
    } catch (erro) {
      console.error('Erro ao carregar estoque:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const handleRegistrarEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await estoqueServiceApi.registrarEntrada({
        livroUuid: formularioEntrada.livroUuid,
        quantidade: Number(formularioEntrada.quantidade),
        custoUnitario: Number(formularioEntrada.custoUnitario),
        fornecedorUuid: formularioEntrada.fornecedorUuid || undefined,
        numeroNotaFiscal: formularioEntrada.numeroNotaFiscal || undefined,
        observacoes: formularioEntrada.observacoes || undefined,
      });
      setMostrarModalEntrada(false);
      setFormularioEntrada({
        livroUuid: '',
        quantidade: '',
        custoUnitario: '',
        fornecedorUuid: '',
        numeroNotaFiscal: '',
        observacoes: '',
      });
      carregarDados();
    } catch (erro) {
      console.error('Erro ao registrar entrada:', erro);
    }
  };

  if (carregando) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Estoque</h1>
        <button
          onClick={() => setMostrarModalEntrada(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Registrar Entrada
        </button>
      </div>

      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-gray-600 text-sm font-medium">Total de Itens</h2>
            <p className="text-3xl font-bold">{kpis.totalItens}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-gray-600 text-sm font-medium">Estoque Crítico</h2>
            <p className="text-3xl font-bold text-red-600">{kpis.itensCriticos}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-gray-600 text-sm font-medium">Limite Crítico</h2>
            <p className="text-3xl font-bold">{kpis.estoqueCriticoLimite} unidades</p>
          </div>
        </div>
      )}

      {estoqueCritico.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-red-600">Estoque Crítico (≤5 unidades)</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Livro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ISBN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd. Disponível</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço Venda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {estoqueCritico.map((item) => (
                  <tr key={item.uuid} className="bg-red-50">
                    <td className="px-6 py-4 whitespace-nowrap">{item.livroTitulo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.livroIsbn}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-red-600">{item.quantidadeDisponivel}</td>
                    <td className="px-6 py-4 whitespace-nowrap">R$ {item.precoVenda.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Todo o Estoque</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Livro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ISBN</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd. Disponível</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd. Reservada</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço Venda</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Custo Atual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {estoque.map((item) => (
              <tr key={item.uuid} className={item.quantidadeDisponivel <= 5 ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">{item.livroTitulo}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.livroIsbn}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.quantidadeDisponivel}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.quantidadeReservada}</td>
                <td className="px-6 py-4 whitespace-nowrap">R$ {item.precoVenda.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">R$ {item.valorCustoAtual.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mostrarModalEntrada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Registrar Entrada de Estoque</h2>
            <form onSubmit={handleRegistrarEntrada}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">UUID do Livro</label>
                <input
                  type="text"
                  value={formularioEntrada.livroUuid}
                  onChange={(e) => setFormularioEntrada({ ...formularioEntrada, livroUuid: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Quantidade</label>
                <input
                  type="number"
                  value={formularioEntrada.quantidade}
                  onChange={(e) => setFormularioEntrada({ ...formularioEntrada, quantidade: e.target.value })}
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
                  value={formularioEntrada.custoUnitario}
                  onChange={(e) => setFormularioEntrada({ ...formularioEntrada, custoUnitario: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  min="0.01"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">UUID do Fornecedor (opcional)</label>
                <input
                  type="text"
                  value={formularioEntrada.fornecedorUuid}
                  onChange={(e) => setFormularioEntrada({ ...formularioEntrada, fornecedorUuid: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nota Fiscal (opcional)</label>
                <input
                  type="text"
                  value={formularioEntrada.numeroNotaFiscal}
                  onChange={(e) => setFormularioEntrada({ ...formularioEntrada, numeroNotaFiscal: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
                <textarea
                  value={formularioEntrada.observacoes}
                  onChange={(e) => setFormularioEntrada({ ...formularioEntrada, observacoes: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setMostrarModalEntrada(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
