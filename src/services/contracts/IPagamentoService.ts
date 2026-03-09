import type { IPagamentoInfo } from '@/interfaces/IPagamento';

export interface IProcessarPagamentoPayload {
  enderecoUuid: string;
  freteUuid: string;
  cupons: string[];
  pagamentosCartao: { cartaoUuid: string; valor: number }[];
  itens: { livroUuid: string; quantidade: number }[];
}

export interface IProcessarPagamentoResponse {
  sucesso: boolean;
  pedidoUuid: string;
  status: string;
}

export interface IPagamentoService {
  getPagamentoInfo(): Promise<IPagamentoInfo>;
  processarPagamento(payload: IProcessarPagamentoPayload): Promise<IProcessarPagamentoResponse>;
}
