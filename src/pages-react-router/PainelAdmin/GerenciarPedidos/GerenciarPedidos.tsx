import { Package, Truck, CheckCircle, Search, AlertCircle } from 'lucide-react';
import { useGerenciarPedidos } from './useGerenciarPedidos';
import type { StatusPedido } from '@/interfaces/pedido';
import styles from './GerenciarPedidos.module.css';

const STATUS_LABELS: Record<StatusPedido, string> = {
  'Em Processamento': 'Em Processamento',
  'Em Trânsito': 'Em Trânsito',
  Entregue: 'Entregue',
  Pendentes: 'Pendente',
  'Aguardando Pagamento': 'Aguardando Pagamento',
  Preparando: 'Preparando',
  Cancelado: 'Cancelado',
  'Em Troca': 'Em Troca',
  'Troca Autorizada': 'Troca Autorizada',
  Trocado: 'Trocado',
  'Devoluções': 'Devoluções',
};

const STATUS_CSS: Record<string, string> = {
  'Em Processamento': 'statusProcessando',
  'Em Trânsito': 'statusTransito',
  Entregue: 'statusEntregue',
};

function formatarMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export const GerenciarPedidos = () => {
  const {
    pedidosFiltrados,
    loading,
    error,
    processando,
    feedbackMsg,
    setFeedbackMsg,
    filtroBusca,
    setFiltroBusca,
    filtroStatus,
    setFiltroStatus,
    getLivroTitulo,
    despachar,
    confirmarEntrega,
    isAprovado,
    isEmTransito,
  } = useGerenciarPedidos();

  if (loading) {
    return <div className={styles.loading}><Package size={32} />Carregando pedidos...</div>;
  }

  if (error) {
    return (
      <div className={styles.erroBox}>
        <AlertCircle size={20} /> Erro ao carregar pedidos: {error}
      </div>
    );
  }

  return (
    <div className={styles.container}>
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
        <div className={styles.feedbackBanner}>
          <CheckCircle size={16} />
          <span>{feedbackMsg}</span>
          <button className={styles.fecharFeedback} onClick={() => setFeedbackMsg('')}>×</button>
        </div>
      )}

      {/* Filtros */}
      <div className={styles.filtros}>
        <div className={styles.buscaWrapper}>
          <Search size={16} className={styles.buscaIcon} />
          <input
            id="busca-pedidos"
            className={styles.inputBusca}
            type="text"
            placeholder="Buscar por nº do pedido ou título do livro..."
            value={filtroBusca}
            onChange={(e) => setFiltroBusca(e.target.value)}
          />
        </div>
        <select
          id="filtro-status-pedidos"
          className={styles.selectStatus}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="todos">Todos os status</option>
          <option value="Em Processamento">Em Processamento</option>
          <option value="Em Trânsito">Em Trânsito</option>
          <option value="Entregue">Entregue</option>
        </select>
      </div>

      {/* Tabela */}
      {pedidosFiltrados.length === 0 ? (
        <div className={styles.vazio}>
          <Package size={48} />
          <p>Nenhum pedido encontrado com esses filtros.</p>
        </div>
      ) : (
        <div className={styles.tabelaWrapper}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Data</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido.uuid}>
                  <td className={styles.colPedido}>
                    #{pedido.uuid.split('-')[1].toUpperCase()}
                  </td>
                  <td>{formatarData(pedido.data)}</td>
                  <td className={styles.colItens}>
                    {pedido.itens.map((item) => (
                      <div key={item.livroUuid} className={styles.itemLinha}>
                        <span>{getLivroTitulo(item.livroUuid)}</span>
                        <span className={styles.itemQtd}>×{item.quantidade}</span>
                      </div>
                    ))}
                  </td>
                  <td className={styles.colTotal}>{formatarMoeda(pedido.total)}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[STATUS_CSS[pedido.status]] ?? styles.statusOutro
                      }`}
                    >
                      {STATUS_LABELS[pedido.status] ?? pedido.status}
                    </span>
                  </td>
                  <td className={styles.colAcoes}>
                    {isAprovado(pedido.status) && (
                      <button
                        id={`btn-despachar-${pedido.uuid}`}
                        className={`${styles.btnAcao} ${styles.btnDespachar}`}
                        disabled={processando === pedido.uuid}
                        onClick={() => despachar(pedido)}
                        title="Despachar pedido para entrega — RF0038"
                      >
                        <Truck size={14} />
                        {processando === pedido.uuid ? 'Despachando...' : 'Despachar'}
                      </button>
                    )}

                    {isEmTransito(pedido.status) && (
                      <button
                        id={`btn-confirmar-entrega-${pedido.uuid}`}
                        className={`${styles.btnAcao} ${styles.btnEntregue}`}
                        disabled={processando === pedido.uuid}
                        onClick={() => confirmarEntrega(pedido.uuid)}
                        title="Confirmar entrega ao cliente — RF0039"
                      >
                        <CheckCircle size={14} />
                        {processando === pedido.uuid ? 'Confirmando...' : 'Entregue'}
                      </button>
                    )}

                    {pedido.status === 'Entregue' && (
                      <span className={styles.concluidoLabel}>
                        <CheckCircle size={14} /> Entregue
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
