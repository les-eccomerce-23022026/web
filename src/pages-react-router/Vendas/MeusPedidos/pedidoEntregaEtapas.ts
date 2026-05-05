import type { StatusPedido } from '@/interfaces/pedido';

/** Maior etapa concluída (1–4). Troca pós-entrega = 4. Cancelado = 0. */
export function statusParaEtapaConcluida(status: StatusPedido): number | 'cancelado' {
  switch (status) {
    case 'Cancelado':
      return 'cancelado';
    case 'Pendentes':
    case 'Aguardando Pagamento':
    case 'Em Processamento':
      return 1;
    case 'Preparando':
    case 'Devoluções':
      return 2;
    case 'Em Trânsito':
      return 3;
    case 'Entregue':
    case 'Em Troca':
    case 'Troca Autorizada':
    case 'Trocado':
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
