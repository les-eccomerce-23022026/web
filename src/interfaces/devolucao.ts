export type StatusTroca = 'Em Troca' | 'Troca Autorizada' | 'Trocado';

export interface IItemTroca {
  livroUuid: string;
  livroTitulo: string;
  quantidade: number;
  precoUnitario: number;
}

export interface ISolicitacaoTroca {
  uuid: string;
  pedidoUuid: string;
  clienteUuid: string;
  itens: IItemTroca[];
  motivo: string;
  dataSolicitacao: string; // ISO 8601
  status: StatusTroca;
}

export interface ICupomTroca {
  uuid: string;
  pedidoOrigemUuid: string;
  clienteUuid: string;
  valor: number;
  codigo: string;
  validade: string; // ISO 8601
  utilizado: boolean;
  dataCriacao: string; // ISO 8601
}
