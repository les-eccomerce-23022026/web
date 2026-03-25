import type { ICheckoutInfo } from '@/interfaces/ICheckout';

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
