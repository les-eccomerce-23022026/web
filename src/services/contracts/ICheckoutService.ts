import type { ICheckoutInfo } from '@/interfaces/ICheckout';
import type { ICupomAplicado } from '@/interfaces/IPagamento';

export interface IVendaPagamentoParcial {
  cartaoUuid: string;
  valor: number;
}

export interface IVendaInput {
  usuarioUuid: string;
  itens: {
    livroUuid: string;
    quantidade: number;
    precoUnitario: number;
  }[];
  valorTotalItens: number;
  valorFrete: number;
  valorTotal: number;
  cuponsAplicados?: ICupomAplicado[];
  pagamentos?: IVendaPagamentoParcial[];
}

export interface IVendaResultado {
  id?: string;
  ven_uuid?: string;
  status?: string;
  mensagem?: string;
}

export interface ICheckoutService {
  getCheckoutInfo(): Promise<ICheckoutInfo>;
  finalizarCompra(dados: IVendaInput): Promise<IVendaResultado>;
}
