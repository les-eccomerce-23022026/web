export type StatusPedido = 'Entregue' | 'Em Trânsito' | 'Preparando' | 'Pendentes' | 'Devoluções' | 'Cancelado';

export interface IItemPedido {
  livroUuid: string;
  quantidade: number;
  precoUnitario: number;
  categoria: string; // Facilitar cálculo no dashboard
}

export interface IPedido {
  uuid: string;
  data: string; // ISO 8601
  clienteUuid: string;
  itens: IItemPedido[];
  total: number;
  status: StatusPedido;
}
