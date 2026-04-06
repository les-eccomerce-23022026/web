export type StatusPedido =
  | 'Entregue'
  | 'Em Trânsito'
  | 'Preparando'
  | 'Pendentes'
  | 'Aguardando Pagamento'
  | 'Em Processamento'
  | 'Em Troca'
  | 'Troca Autorizada'
  | 'Trocado'
  | 'Cancelado'
  | 'Devoluções';

export interface IItemPedido {
  livroUuid: string;
  titulo?: string;
  quantidade: number;
  precoUnitario: number;
  categoria: string;
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
  clienteUuid: string;
  itens: IItemPedido[];
  total: number;
  status: StatusPedido;
  motivo?: string;
  enderecoUuid?: string;
  freteUuid?: string;
  formaPagamento?: IFormaPagamentoPedido[];
}

