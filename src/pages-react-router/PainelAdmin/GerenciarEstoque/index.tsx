'use client';

import { useState } from 'react';
import { useEstoque } from '@/hooks/useEstoque';
import type { IEntradaEstoque, IAtualizacaoEstoque, IItemEstoque } from '@/services/contracts/estoqueService';
import { AdminToolbar } from '@/components/Admin/AdminToolbar';
import { ErrorState } from '@/components/Comum/ErrorState/ErrorState';
import { LoadingState } from '@/components/Comum/LoadingState/LoadingState';
import { ITENS_POR_PAGINA } from '@/config/constantesNegocio';
import { Tabs, type TabItem } from '@/components/Comum/Tabs';
import { ModalEntradaEstoque } from './ModalEntradaEstoque';
import { ModalEdicaoEstoque } from './ModalEdicaoEstoque';
import { KPIsEstoque } from './KPIsEstoque';
import { TabelaEstoqueCritico } from './TabelaEstoqueCritico';
import { TabelaEstoqueCompleto } from './TabelaEstoqueCompleto';
import { estoqueServiceApi } from '@/services/api/estoqueServiceApi';

export default function GerenciarEstoque() {
  const { estoque, estoqueCritico, kpis, loading, error, carregarDados, registrarEntrada } = useEstoque();
  const [mostrarModalEntrada, setMostrarModalEntrada] = useState(false);
  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  const [estoqueSelecionado, setEstoqueSelecionado] = useState<IItemEstoque | null>(null);
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
  const [formularioEdicao, setFormularioEdicao] = useState({
    quantidadeDisponivel: '',
    precoVenda: '',
    valorCustoAtual: '',
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

  const handleEditarEstoque = (estoque: IItemEstoque) => {
    setEstoqueSelecionado(estoque);
    setFormularioEdicao({
      quantidadeDisponivel: estoque.quantidadeDisponivel.toString(),
      precoVenda: estoque.precoVenda.toString(),
      valorCustoAtual: estoque.valorCustoAtual.toString(),
    });
    setMostrarModalEdicao(true);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estoqueSelecionado) return;

    setErroFormulario(null);
    setEnviandoFormulario(true);

    try {
      await estoqueServiceApi.atualizarEstoque({
        estoqueUuid: estoqueSelecionado.uuid,
        quantidadeDisponivel: formularioEdicao.quantidadeDisponivel ? Number(formularioEdicao.quantidadeDisponivel) : undefined,
        precoVenda: formularioEdicao.precoVenda ? Number(formularioEdicao.precoVenda) : undefined,
        valorCustoAtual: formularioEdicao.valorCustoAtual ? Number(formularioEdicao.valorCustoAtual) : undefined,
      } as IAtualizacaoEstoque);

      setMostrarModalEdicao(false);
      setEstoqueSelecionado(null);
      carregarDados();
    } catch (erro) {
      console.error('Erro ao atualizar estoque:', erro);
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao atualizar estoque.';
      setErroFormulario(mensagem);
    } finally {
      setEnviandoFormulario(false);
    }
  };

  const handleFecharModalEdicao = () => {
    setMostrarModalEdicao(false);
    setEstoqueSelecionado(null);
    setErroFormulario(null);
  };

  const handleAlterarCampoEdicao = (campo: string, valor: string) => {
    setFormularioEdicao((prev) => ({ ...prev, [campo]: valor }));
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

  const tabs: TabItem[] = [
    {
      id: 'critico',
      label: `Estoque Crítico (${estoqueCritico.length})`,
      content: (
        <div>
          {estoqueCritico.length > 0 ? (
            <TabelaEstoqueCritico dados={estoqueCritico} aoEditarEstoque={handleEditarEstoque} />
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                ✓ Nenhum item em estoque crítico (limite: {kpis?.estoqueCriticoLimite || 5} unidades)
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'completo',
      label: 'Todo o Estoque',
      content: (
        <TabelaEstoqueCompleto
          dados={estoque}
          paginaAtual={paginaAtual}
          itensPorPagina={ITENS_POR_PAGINA}
          aoMudarPagina={setPaginaAtual}
          aoEditarEstoque={handleEditarEstoque}
        />
      ),
    },
  ];

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

      <Tabs tabs={tabs} defaultTab="critico" />

      <ModalEntradaEstoque
        mostrar={mostrarModalEntrada}
        formulario={formularioEntrada}
        erro={erroFormulario}
        enviando={enviandoFormulario}
        aoFechar={handleFecharModal}
        aoSalvar={handleRegistrarEntrada}
        aoAlterarCampo={handleAlterarCampoFormulario}
      />

      <ModalEdicaoEstoque
        mostrar={mostrarModalEdicao}
        estoque={estoqueSelecionado}
        formulario={formularioEdicao}
        erro={erroFormulario}
        enviando={enviandoFormulario}
        aoFechar={handleFecharModalEdicao}
        aoSalvar={handleSalvarEdicao}
        aoAlterarCampo={handleAlterarCampoEdicao}
      />
    </div>
  );
}
