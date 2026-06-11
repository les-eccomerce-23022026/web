/**
 * Constantes de Negócio
 * Valores configuráveis para regras de negócio do sistema
 */

/** Limite padrão para estoque crítico (unidades) */
export const LIMITE_ESTOQUE_CRITICO = 5;

/** Quantidade de itens por página em listagens */
export const ITENS_POR_PAGINA = 10;

/**
 * Constantes de Status de Pedido
 * Centralizadas para uso em todo o frontend
 */
export const STATUS_PEDIDO = {
  EM_PROCESSAMENTO: 'Em Processamento',
  EM_TRANSITO: 'Em Trânsito',
  ENTREGUE: 'Entregue',
  PENDENTE: 'Pendente',
  PENDENTES: 'Pendentes',
  AGUARDANDO_PAGAMENTO: 'Aguardando Pagamento',
  PREPARANDO: 'Preparando',
  CANCELADO: 'Cancelado',
  EM_TROCA: 'Em Troca',
  TROCA_AUTORIZADA: 'Troca Autorizada',
  TROCA_REJEITADA: 'Troca Rejeitada',
  TROCADO: 'Trocado',
  EM_DEVOLUCAO: 'Em Devolução',
  DEVOLUCAO_AUTORIZADA: 'Devolução Autorizada',
  DEVOLUCAO_REJEITADA: 'Devolução Rejeitada',
  DEVOLVIDO: 'Devolvido',
  DEVOLUCOES: 'Devoluções',
  PAGAMENTO_PENDENTE: 'Pagamento Pendente',
  REJEITADO: 'Rejeitado',
} as const;

export type StatusPedidoConstante = typeof STATUS_PEDIDO[keyof typeof STATUS_PEDIDO];
