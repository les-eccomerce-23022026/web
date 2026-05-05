import type { StatusPedido, IPedido, IItemPedido } from '@/interfaces/pedido';
import type { ILivro } from '@/interfaces/livro';
import styles from './MeusPedidos.module.css';

export function formatMoeda(n: number): string {
  return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

export function tituloItem(item: IItemPedido, livrosMap: Map<string, ILivro>): string {
  if (item.titulo) return item.titulo;
  return livrosMap.get(item.livroUuid)?.titulo ?? item.livroUuid;
}

export function getStatusClass(status: StatusPedido): string {
  const map: Record<string, string> = {
    Entregue: styles.statusEntregue,
    'Em Trânsito': styles.statusTransito,
    Preparando: styles.statusPreparando,
    Pendentes: styles.statusPendente,
    'Aguardando Pagamento': styles.statusAguardandoPagamento,
    'Em Processamento': styles.statusProcessamento,
    'Em Troca': styles.statusEmTroca,
    'Troca Autorizada': styles.statusTrocaAutorizada,
    Trocado: styles.statusTrocado,
    Cancelado: styles.statusCancelado,
    Devoluções: styles.statusDevolucoes,
  };
  return map[status] || '';
}

export const totalUnidades = (p: IPedido) =>
  p.itens.reduce((acc, i) => acc + i.quantidade, 0);
