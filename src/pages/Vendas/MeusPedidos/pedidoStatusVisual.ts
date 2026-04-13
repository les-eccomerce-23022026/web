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

const statusMapping: Record<StatusPedido, PedidoStatusVisual> = {
  'Entregue': { Icon: CheckCircle, variant: 'entregue' },
  'Em Trânsito': { Icon: Truck, variant: 'transito' },
  'Preparando': { Icon: Package, variant: 'preparando' },
  'Pendentes': { Icon: Clock, variant: 'processamento' },
  'Aguardando Pagamento': { Icon: Clock, variant: 'processamento' },
  'Em Processamento': { Icon: Clock, variant: 'processamento' },
  'Falha na Entrega': { Icon: XCircle, variant: 'problema' },
  'Trocado': { Icon: CheckCircle, variant: 'entregue' },
  'Em Troca': { Icon: AlertTriangle, variant: 'problema' },
  'Troca Autorizada': { Icon: AlertTriangle, variant: 'problema' },
  'Devoluções': { Icon: AlertTriangle, variant: 'problema' },
  'Cancelado': { Icon: AlertTriangle, variant: 'problema' },
};

export function getPedidoStatusVisual(status: StatusPedido): PedidoStatusVisual {
  return statusMapping[status] || { Icon: Package, variant: 'preparando' };
}
