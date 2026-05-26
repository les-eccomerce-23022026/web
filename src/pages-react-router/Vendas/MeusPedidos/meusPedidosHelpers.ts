import type { StatusPedido, IPedido, IItemPedido } from '../../../interfaces/pedido';
import type { ILivro } from '../../../interfaces/livro';

export function formatMoeda(n: number): string {
  return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

export function tituloItem(item: IItemPedido, livrosMap: Map<string, ILivro>): string {
  if (item.titulo) return item.titulo;
  return livrosMap.get(item.livroUuid)?.titulo ?? item.livroUuid;
}

export function getStatusClass(status: StatusPedido): string {
  const map: Record<string, string> = {
    Entregue: 'status-entregue',
    'Em Trânsito': 'status-transito',
    Preparando: 'status-preparando',
    Pendentes: 'status-pendente',
    'Aguardando Pagamento': 'status-aguardando-pagamento',
    'Em Processamento': 'status-processamento',
    'Em Troca': 'status-em-troca',
    'Troca Autorizada': 'status-troca-autorizada',
    Trocado: 'status-trocado',
    Cancelado: 'status-cancelado',
    Devoluções: 'status-devolucoes',
  };
  return map[status] || '';
}

export const totalUnidades = (p: IPedido) =>
  p.itens.reduce((acc, i) => acc + i.quantidade, 0);
