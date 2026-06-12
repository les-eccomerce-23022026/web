'use client';

import { Package, CheckCircle } from 'lucide-react';
import { useGerenciarPedidos } from './useGerenciarPedidos';
import { AdminToolbar } from '@/components/Admin/AdminToolbar';
import { AdminTable } from '@/components/Admin/AdminTable';
import { obterColunasGerenciarPedidos } from './colunasTabela';
import { STATUS_PEDIDO } from '@/config/constantesNegocio';
import styles from './style.module.css';

export const GerenciarPedidos = () => {
  const {
    pedidosFiltrados,
    pedidosPaginados,
    totalPaginas,
    paginaAtual,
    aoMudarPagina,
    filtrosColuna,
    handleFiltroColunaChange,
    loading,
    error,
    processando,
    feedbackMsg,
    setFeedbackMsg,
    setFiltroBusca,
    filtroStatus,
    setFiltroStatus,
    getLivroTitulo,
    despachar,
    confirmarEntrega,
    isAprovado,
    isEmTransito,
    isPagamentoPendente,
    aprovarPagamento,
    rejeitarPagamento,
  } = useGerenciarPedidos();

  const colunas = obterColunasGerenciarPedidos({
    getLivroTitulo,
    despachar,
    confirmarEntrega,
    aprovarPagamento,
    rejeitarPagamento,
    processando,
    isAprovado,
    isEmTransito,
    isPagamentoPendente,
    styles,
  });

  return (
    <div className={styles.container} data-cy="pedidos-painel">
      {/* Header */}
      <div className={styles.headerSection}>
        <div>
          <h2>Gerenciar Pedidos</h2>
          <p className={styles.subtitulo}>
            RF0038 — Despachar para Entrega · RF0039 — Confirmar Entrega · RF0053 — Baixa de Estoque
          </p>
        </div>
        <span className={styles.contador}>{pedidosFiltrados.length} pedido(s)</span>
      </div>

      {/* Feedback */}
      {feedbackMsg && (
        <div className={styles.feedbackBanner} data-cy="feedback-banner">
          <CheckCircle size={16} />
          <span>{feedbackMsg}</span>
          <button className={styles.fecharFeedback} onClick={() => setFeedbackMsg('')}>×</button>
        </div>
      )}

      {/* Toolbar com busca e filtros */}
      <AdminToolbar
        placeholderBusca="Buscar por nº do pedido ou título do livro..."
        onBusca={setFiltroBusca}
        filtros={[
          {
            id: 'status',
            label: 'Status',
            value: filtroStatus,
            opcoes: [
              { label: 'Todos os status', value: 'todos' },
              { label: 'Pagamento Pendente', value: STATUS_PEDIDO.PAGAMENTO_PENDENTE },
              { label: 'Em Processamento', value: STATUS_PEDIDO.EM_PROCESSAMENTO },
              { label: 'Em Trânsito', value: STATUS_PEDIDO.EM_TRANSITO },
              { label: 'Entregue', value: STATUS_PEDIDO.ENTREGUE },
              { label: 'Rejeitado', value: STATUS_PEDIDO.REJEITADO },
            ],
          },
        ]}
        onFiltroChange={(id, valor) => {
          if (id === 'status') setFiltroStatus(valor);
        }}
      />

      {/* Tabela */}
      <AdminTable
        colunas={colunas}
        dados={pedidosPaginados}
        rowKey="uuid"
        carregando={loading}
        erro={error || undefined}
        estadoVazio={{
          titulo: 'Nenhum pedido encontrado',
          mensagem: 'Não encontramos pedidos com esses filtros.',
          icone: <Package size={48} />,
        }}
        paginacao={{
          paginaAtual,
          totalPaginas,
          aoMudarPagina,
        }}
        filtrosColuna={Object.entries(filtrosColuna).map(([key, valor]) => ({ key, valor }))}
        onFiltroColunaChange={handleFiltroColunaChange}
        className={styles.tabelaWrapper}
      />
    </div>
  );
}
