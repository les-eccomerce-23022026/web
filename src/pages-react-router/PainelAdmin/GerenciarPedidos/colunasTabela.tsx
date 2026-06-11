import { Truck, CheckCircle, XCircle, Check } from 'lucide-react';
import type { IColuna } from '@/components/Admin/AdminTable/types';
import type { StatusPedido, IPedido } from '../../../interfaces/pedido';
import { STATUS_LABELS, STATUS_CSS, formatarMoeda, formatarData, type StatusPedidoConstante } from './constantes';
import { STATUS_PEDIDO } from '@/config/constantesNegocio';

interface PropsColunas {
  getLivroTitulo: (livroUuid: string) => string;
  despachar: (pedido: IPedido) => void;
  confirmarEntrega: (pedidoUuid: string) => void;
  abrirModalRejeicao: (pedidoUuid: string) => void;
  aprovarPagamento: (pedidoUuid: string) => void;
  rejeitarPagamento: (pedidoUuid: string) => void;
  processando: string | null;
  isAprovado: (status: StatusPedido) => boolean;
  isEmTransito: (status: StatusPedido) => boolean;
  isPagamentoPendente: (status: StatusPedido) => boolean;
  styles: any;
}

export function obterColunasGerenciarPedidos({
  getLivroTitulo,
  despachar,
  confirmarEntrega,
  abrirModalRejeicao,
  aprovarPagamento,
  rejeitarPagamento,
  processando,
  isAprovado,
  isEmTransito,
  isPagamentoPendente,
  styles,
}: PropsColunas): IColuna<IPedido>[] {
  return [
    {
      key: 'uuid',
      label: 'Pedido',
      render: (_: string, pedido: IPedido) => (
        <span className={styles.colPedido}>
          #{pedido.uuid?.split('-')[1]?.toUpperCase() || pedido.uuid}
        </span>
      ),
    },
    {
      key: 'data',
      label: 'Data',
      render: (data: string) => formatarData(data),
    },
    {
      key: 'itens',
      label: 'Itens',
      render: (_: any, pedido: IPedido) => (
        <div className={styles.colItens}>
          {pedido.itens.map((item, idx) => (
            <div key={`${item.livroUuid}-${idx}`} className={styles.itemLinha}>
              <span>{getLivroTitulo(item.livroUuid)}</span>
              <span className={styles.itemQtd}>×{item.quantidade}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      render: (total: number) => (
        <span className={styles.colTotal}>{formatarMoeda(total)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => (
        <span
          className={`${styles.statusBadge} ${
            styles[STATUS_CSS[status as StatusPedidoConstante]] ?? styles.statusOutro
          }`}
          data-cy="status-badge"
        >
          {STATUS_LABELS[status as StatusPedido] ?? status}
        </span>
      ),
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (_: any, pedido: IPedido) => (
        <div className={styles.colAcoes}>
          {isPagamentoPendente(pedido.status) && (
            <>
              <button
                id={`btn-aprovar-pagamento-${pedido.uuid}`}
                data-cy={`btn-aprovar-pagamento-${pedido.uuid}`}
                className={`${styles.btnAcao} ${styles.btnAprovar}`}
                disabled={processando === pedido.uuid}
                onClick={() => aprovarPagamento(pedido.uuid)}
                title="Aprovar pagamento — RF0019"
              >
                <Check size={14} />
                {processando === pedido.uuid ? 'Aprovando...' : 'Aprovar'}
              </button>
              <button
                id={`btn-rejeitar-pagamento-${pedido.uuid}`}
                data-cy={`btn-rejeitar-pagamento-${pedido.uuid}`}
                className={`${styles.btnAcao} ${styles.btnRejeitar}`}
                disabled={processando === pedido.uuid}
                onClick={() => rejeitarPagamento(pedido.uuid)}
                title="Rejeitar pagamento — RF0019"
              >
                <XCircle size={14} />
                {processando === pedido.uuid ? 'Rejeitando...' : 'Rejeitar'}
              </button>
            </>
          )}
          {isAprovado(pedido.status) && (
            <button
              id={`btn-despachar-${pedido.uuid}`}
              data-cy={`btn-despachar-${pedido.uuid}`}
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
              data-cy={`btn-confirmar-entrega-${pedido.uuid}`}
              className={`${styles.btnAcao} ${styles.btnEntregue}`}
              disabled={processando === pedido.uuid}
              onClick={() => confirmarEntrega(pedido.uuid)}
              title="Confirmar entrega ao cliente — RF0039"
            >
              <CheckCircle size={14} />
              {processando === pedido.uuid ? 'Confirmando...' : 'Entregue'}
            </button>
          )}

          {pedido.status === STATUS_PEDIDO.ENTREGUE && (
            <span className={styles.concluidoLabel}>
              <CheckCircle size={14} /> Entregue
            </span>
          )}
        </div>
      ),
    },
  ];
}
