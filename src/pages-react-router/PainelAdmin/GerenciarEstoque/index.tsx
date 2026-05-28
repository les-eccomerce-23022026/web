'use client';

import { useState } from 'react';
import { useEstoque } from '@/hooks/useEstoque';
import type { IEntradaEstoque } from '@/services/contracts/estoqueService';
import { AdminToolbar } from '@/components/Admin/AdminToolbar';
import { ErrorState } from '@/components/Comum/ErrorState/ErrorState';
import { LoadingState } from '@/components/Comum/LoadingState/LoadingState';
import { ITENS_POR_PAGINA } from '@/config/constantesNegocio';
import { ModalEntradaEstoque } from './ModalEntradaEstoque';
import { KPIsEstoque } from './KPIsEstoque';
import { TabelaEstoqueCritico } from './TabelaEstoqueCritico';
import { TabelaEstoqueCompleto } from './TabelaEstoqueCompleto';

export default function GerenciarEstoque() {
  const { estoque, estoqueCritico, kpis, loading, error, carregarDados, registrarEntrada } = useEstoque();
  const [mostrarModalEntrada, setMostrarModalEntrada] = useState(false);
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);
  const [enviandoFormulario, setEnviandoFormulario] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [formularioEntrada, setFormularioEntrada] = useState({
    livroUuid: '',
    quantidade: '',
    custoUnitario: '',
    fornecedorUuid: '',
    numeroNotaFiscal: '',
    observacoes: '',
  });

  const handleRegistrarEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroFormulario(null);
    setEnviandoFormulario(true);

    try {
      await registrarEntrada({
        livroUuid: formularioEntrada.livroUuid,
        quantidade: Number(formularioEntrada.quantidade),
        custoUnitario: Number(formularioEntrada.custoUnitario),
        fornecedorUuid: formularioEntrada.fornecedorUuid || undefined,
        numeroNotaFiscal: formularioEntrada.numeroNotaFiscal || undefined,
        observacoes: formularioEntrada.observacoes || undefined,
        dataEntrada: new Date().toISOString(),
      } as IEntradaEstoque);

      setMostrarModalEntrada(false);
      setFormularioEntrada({
        livroUuid: '',
        quantidade: '',
        custoUnitario: '',
        fornecedorUuid: '',
        numeroNotaFiscal: '',
        observacoes: '',
      });
      return;
    }

    catch (erro) {
      console.error('Erro ao registrar entrada:', erro);
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao registrar entrada de estoque.';
      setErroFormulario(mensagem);
    } finally {
      setEnviandoFormulario(false);
    }
  };

  const handleAlterarCampoFormulario = (campo: string, valor: string) => {
    setFormularioEntrada((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleFecharModal = () => {
    setMostrarModalEntrada(false);
    setErroFormulario(null);
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState message="Carregando dados do estoque..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorState
          title="Erro ao carregar estoque"
          message={error.message || 'Não foi possível carregar os dados do estoque. Verifique sua conexão e tente novamente.'}
          onRetry={carregarDados}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Estoque</h1>

      <AdminToolbar
        placeholderBusca=""
        onBusca={() => {}}
        mostrarBusca={false}
        mostrarFiltros={false}
        acoes={[
          {
            label: 'Registrar Entrada',
            onClick: () => setMostrarModalEntrada(true),
            variante: 'primario',
          },
        ]}
      />

      {kpis && <KPIsEstoque kpis={kpis} />}

      {estoqueCritico.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-red-600">
            Estoque Crítico (≤{kpis?.estoqueCriticoLimite || 5} unidades)
          </h2>
          <TabelaEstoqueCritico dados={estoqueCritico} />
        </div>
      )}

      {estoqueCritico.length === 0 && kpis && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            ✓ Nenhum item em estoque crítico (limite: {kpis.estoqueCriticoLimite} unidades)
          </p>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Todo o Estoque</h2>

      <TabelaEstoqueCompleto
        dados={estoque}
        paginaAtual={paginaAtual}
        itensPorPagina={ITENS_POR_PAGINA}
        aoMudarPagina={setPaginaAtual}
      />

      <ModalEntradaEstoque
        mostrar={mostrarModalEntrada}
        formulario={formularioEntrada}
        erro={erroFormulario}
        enviando={enviandoFormulario}
        aoFechar={handleFecharModal}
        aoSalvar={handleRegistrarEntrada}
        aoAlterarCampo={handleAlterarCampoFormulario}
      />
    </div>
  );
}
