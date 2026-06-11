import type { StatusPedido } from '../../../interfaces/pedido';
import { STATUS_PEDIDO } from '@/config/constantesNegocio';

/** Maior etapa concluída (1–4). Troca pós-entrega = 4. Cancelado = 0. */
export function statusParaEtapaConcluida(status: StatusPedido): number | 'cancelado' {
  switch (status) {
    case STATUS_PEDIDO.CANCELADO:
      return 'cancelado';
    case STATUS_PEDIDO.PENDENTE:
    case STATUS_PEDIDO.PENDENTES:
    case STATUS_PEDIDO.AGUARDANDO_PAGAMENTO:
    case STATUS_PEDIDO.EM_PROCESSAMENTO:
      return 1;
    case STATUS_PEDIDO.PREPARANDO:
    case STATUS_PEDIDO.DEVOLUCOES:
      return 2;
    case STATUS_PEDIDO.EM_TRANSITO:
      return 3;
    case STATUS_PEDIDO.ENTREGUE:
    case STATUS_PEDIDO.EM_TROCA:
    case STATUS_PEDIDO.TROCA_AUTORIZADA:
    case STATUS_PEDIDO.TROCADO:
      return 4;
    default:
      return 1;
  }
}

/** 0–100 para barra fina alinhada à timeline (4 etapas). */
export function percentualBarraEntrega(status: StatusPedido): number {
  const etapa = statusParaEtapaConcluida(status);
  if (etapa === 'cancelado') return 0;
  return (etapa / 4) * 100;
}
