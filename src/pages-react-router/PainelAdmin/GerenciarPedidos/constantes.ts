import type { StatusPedido } from '../../../interfaces/pedido';

export const STATUS_LABELS: Record<StatusPedido, string> = {
  'Em Processamento': 'Em Processamento',
  'Em Trânsito': 'Em Trânsito',
  Entregue: 'Entregue',
  Pendentes: 'Pendente',
  'Aguardando Pagamento': 'Aguardando Pagamento',
  Preparando: 'Preparando',
  Cancelado: 'Cancelado',
  'Em Troca': 'Em Troca',
  'Troca Autorizada': 'Troca Autorizada',
  Trocado: 'Trocado',
  'Devoluções': 'Devoluções',
};

export const STATUS_CSS: Record<string, string> = {
  'Em Processamento': 'statusProcessando',
  'Em Trânsito': 'statusTransito',
  Entregue: 'statusEntregue',
};

export function formatarMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}
