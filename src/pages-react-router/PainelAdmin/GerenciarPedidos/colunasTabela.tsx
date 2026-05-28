import { Truck, CheckCircle } from 'lucide-react';
import type { IColuna } from '@/components/Admin/AdminTable/types';
import type { StatusPedido, IPedido } from '../../../interfaces/pedido';
import { STATUS_LABELS, STATUS_CSS, formatarMoeda, formatarData } from './constantes';

interface PropsColunas {
  getLivroTitulo: (livroUuid: string) => string;
  despachar: (pedido: IPedido) => void;
  confirmarEntrega: (pedidoUuid: string) => void;
  processando: string | null;
  isAprovado: (status: StatusPedido) => boolean;
  isEmTransito: (status: StatusPedido) => boolean;
  styles: any;
}

export function obterColunasGerenciarPedidos({
  getLivroTitulo,
  despachar,
  confirmarEntrega,
  processando,
  isAprovado,
  isEmTransito,
  styles,
}: PropsColunas): IColuna<IPedido>[] {
  return [
    {
      key: 'uuid',
      label: 'Pedido',
      render: (_: string, pedido: IPedido) => (
        <span className={styles.colPedido}>
          #{pedido.uuid.split('-')[1].toUpperCase()}
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
          {pedido.itens.map((item) => (
            <div key={item.livroUuid} className={styles.itemLinha}>
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
            styles[STATUS_CSS[status]] ?? styles.statusOutro
          }`}
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
        </div>
      ),
    },
  ];
}
