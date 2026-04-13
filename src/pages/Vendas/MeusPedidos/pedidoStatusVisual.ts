import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
} from 'lucide-react';
import type { StatusPedido } from '@/interfaces/pedido';

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
    case 'Entregue':
      return { Icon: CheckCircle, variant: 'entregue' };
    case 'Em Trânsito':
      return { Icon: Truck, variant: 'transito' };
    case 'Preparando':
      return { Icon: Package, variant: 'preparando' };
    case 'Pendentes':
    case 'Aguardando Pagamento':
    case 'Em Processamento':
      return { Icon: Clock, variant: 'processamento' };
    case 'Falha na Entrega':
      return { Icon: XCircle, variant: 'problema' };
    case 'Trocado':
      return { Icon: CheckCircle, variant: 'entregue' };
    case 'Em Troca':
    case 'Troca Autorizada':
    case 'Devoluções':
    case 'Cancelado':
      return { Icon: AlertTriangle, variant: 'problema' };
    default:
      return { Icon: Package, variant: 'preparando' };
  }
}
