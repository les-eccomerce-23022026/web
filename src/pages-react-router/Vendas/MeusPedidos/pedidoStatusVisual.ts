import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Truck,
} from 'lucide-react';
import type { StatusPedido } from '../../../interfaces/pedido';
import { STATUS_PEDIDO } from '@/config/constantesNegocio';

/** Agrupa estilos de badge e barra no CSS module. */
export type PedidoStatusVariant =
  | 'entregue'
  | 'transito'
  | 'preparando'
  | 'processamento'
  | 'problema';

export type PedidoStatusVisual = {
  Icon: LucideIcon;
  variant: PedidoStatusVariant;
};

export function getPedidoStatusVisual(status: StatusPedido): PedidoStatusVisual {
  switch (status) {
    case STATUS_PEDIDO.ENTREGUE:
      return { Icon: CheckCircle, variant: 'entregue' };
    case STATUS_PEDIDO.EM_TRANSITO:
      return { Icon: Truck, variant: 'transito' };
    case STATUS_PEDIDO.PREPARANDO:
      return { Icon: Package, variant: 'preparando' };
    case STATUS_PEDIDO.PENDENTE:
    case STATUS_PEDIDO.PENDENTES:
    case STATUS_PEDIDO.AGUARDANDO_PAGAMENTO:
    case STATUS_PEDIDO.EM_PROCESSAMENTO:
      return { Icon: Clock, variant: 'processamento' };
    case STATUS_PEDIDO.TROCADO:
      return { Icon: CheckCircle, variant: 'entregue' };
    case STATUS_PEDIDO.EM_TROCA:
    case STATUS_PEDIDO.TROCA_AUTORIZADA:
    case STATUS_PEDIDO.DEVOLUCOES:
    case STATUS_PEDIDO.CANCELADO:
      return { Icon: AlertTriangle, variant: 'problema' };
    default:
      return { Icon: Package, variant: 'preparando' };
  }
}
