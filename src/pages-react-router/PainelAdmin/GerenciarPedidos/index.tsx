'use client';

import { Package, CheckCircle } from 'lucide-react';
import { useGerenciarPedidos } from './useGerenciarPedidos';
import { AdminToolbar } from '@/components/Admin/AdminToolbar';
import { AdminTable } from '@/components/Admin/AdminTable';
import { obterColunasGerenciarPedidos } from './colunasTabela';
import styles from './style.module.css';

export const GerenciarPedidos = () => {
  const {
    pedidosFiltrados,
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
  } = useGerenciarPedidos();

  const colunas = obterColunasGerenciarPedidos({
    getLivroTitulo,
    despachar,
    confirmarEntrega,
    processando,
    isAprovado,
    isEmTransito,
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
              { label: 'Em Processamento', value: 'Em Processamento' },
              { label: 'Em Trânsito', value: 'Em Trânsito' },
              { label: 'Entregue', value: 'Entregue' },
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
        dados={pedidosFiltrados}
        rowKey="uuid"
        carregando={loading}
        erro={error}
        estadoVazio={{
          titulo: 'Nenhum pedido encontrado',
          mensagem: 'Não encontramos pedidos com esses filtros.',
          icone: <Package size={48} />,
        }}
        className={styles.tabelaWrapper}
      />
    </div>
  );
}
