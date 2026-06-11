export type StatusPedido =
  | 'Entregue'
  | 'Em Trânsito'
  | 'Preparando'
  | 'Pendente'
  | 'Pendentes'
  | 'Aguardando Pagamento'
  | 'Pagamento Pendente'
  | 'Em Processamento'
  | 'Em Troca'
  | 'Troca Autorizada'
  | 'Troca Rejeitada'
  | 'Trocado'
  | 'Cancelado'
  | 'Rejeitado'
  | 'Devoluções'
  | 'Em Devolução'
  | 'Devolução Autorizada'
  | 'Devolução Rejeitada'
  | 'Devolvido';

export interface IItemPedido {
  uuid?: string;
  livroUuid: string;
  titulo?: string;
  quantidade: number;
  precoUnitario: number;
  categoria: string;
  emTroca?: boolean;
}

export interface IFormaPagamentoPedido {
  tipo: 'cartao' | 'cupom';
  cartaoFinal?: string;
  bandeira?: string;
  codigo?: string;
  valor: number;
}

export interface IPedido {
  uuid: string;
  data: string; // ISO 8601
  dataEntrega?: string; // ISO 8601 - data em que o pedido foi entregue
  dataPrevistaEntrega?: string; // ISO 8601 - data prevista calculada no despacho
  clienteUuid: string;
  itens: IItemPedido[];
  total: number;
  status: StatusPedido;
  motivo?: string;
  enderecoUuid?: string;
  freteUuid?: string;
  formaPagamento?: IFormaPagamentoPedido[];
}

