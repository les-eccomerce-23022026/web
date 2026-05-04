import type { ICheckoutInfo } from '@/interfaces/checkout';

export interface IVendaInput {
  usuarioUuid: string;
  itens: {
    livroUuid: string;
    quantidade: number;
    precoUnitario: number;
  }[];
  valorTotalItens: number;
  valorFrete: number;
  /** Deve ser `valorTotalItens + valorFrete` (sem desconto de cupom — cupons são liquidados em `/pagamentos/selecionar`). */
  valorTotal: number;
  /** UUID da cotação persistida no backend (preferencial). */
  cotacaoUuid?: string;
}

export interface IVendaResultado {
  id?: string;
  ven_uuid?: string;
  status?: string;
  mensagem?: string;
  /** Frete efetivamente gravado na venda (pode divergir do valor cotado na UI se o backend usa `cotacaoUuid`). */
  frete?: number;
}

export interface ICheckoutService {
  getCheckoutInfo(): Promise<ICheckoutInfo>;
  finalizarCompra(dados: IVendaInput): Promise<IVendaResultado>;
}
