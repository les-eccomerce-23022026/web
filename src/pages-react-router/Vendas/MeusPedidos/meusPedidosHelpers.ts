import type { StatusPedido, IPedido, IItemPedido } from '../../../interfaces/pedido';
import type { ILivro } from '../../../interfaces/livro';
import { STATUS_PEDIDO } from '@/config/constantesNegocio';

export function formatMoeda(n: number | undefined | null): string {
  if (n === undefined || n === null || isNaN(n)) {
    return 'R$ 0,00';
  }
  return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

export function tituloItem(item: IItemPedido, livrosMap: Map<string, ILivro>): string {
  if (item.titulo) return item.titulo;
  return livrosMap.get(item.livroUuid)?.titulo ?? item.livroUuid;
}

export function getStatusClass(status: StatusPedido): string {
  const map: Record<string, string> = {
    [STATUS_PEDIDO.ENTREGUE]: 'status_entregue',
    [STATUS_PEDIDO.EM_TRANSITO]: 'status_transito',
    [STATUS_PEDIDO.PREPARANDO]: 'status_preparando',
    [STATUS_PEDIDO.PENDENTE]: 'status_pendente',
    [STATUS_PEDIDO.PENDENTES]: 'status_pendentes',
    [STATUS_PEDIDO.AGUARDANDO_PAGAMENTO]: 'status_aguardando_pagamento',
    [STATUS_PEDIDO.PAGAMENTO_PENDENTE]: 'status_pagamento_pendente',
    [STATUS_PEDIDO.EM_PROCESSAMENTO]: 'status_processamento',
    [STATUS_PEDIDO.EM_TROCA]: 'status_em_troca',
    [STATUS_PEDIDO.TROCA_AUTORIZADA]: 'status_troca_autorizada',
    [STATUS_PEDIDO.TROCADO]: 'status_trocado',
    [STATUS_PEDIDO.CANCELADO]: 'status_cancelado',
    [STATUS_PEDIDO.DEVOLUCOES]: 'status_devolucoes',
  };
  return map[status] || '';
}

export const totalUnidades = (p: IPedido) =>
  p.itens.reduce((acc, i) => acc + i.quantidade, 0);
