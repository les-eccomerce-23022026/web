import type { StatusPedido } from '@/interfaces/pedido';

const etapaMapping: Record<StatusPedido, number | 'cancelado'> = {
  'Cancelado': 'cancelado',
  'Pendentes': 1,
  'Aguardando Pagamento': 1,
  'Em Processamento': 1,
  'Preparando': 2,
  'Devoluções': 2,
  'Em Trânsito': 3,
  'Falha na Entrega': 3,
  'Entregue': 4,
  'Em Troca': 4,
  'Troca Autorizada': 4,
  'Trocado': 4,
};

/** Maior etapa concluída (1–4). Troca pós-entrega = 4. Cancelado = 0. */
export function statusParaEtapaConcluida(status: StatusPedido): number | 'cancelado' {
  return etapaMapping[status] || 1;
}

/** 0–100 para barra fina alinhada à timeline (4 etapas). */
export function percentualBarraEntrega(status: StatusPedido): number {
  const etapa = statusParaEtapaConcluida(status);
  if (etapa === 'cancelado') return 0;
  return (etapa / 4) * 100;
}
