import type { ICheckoutInfo } from '@/interfaces/checkout';

export interface IVendaInput {
  usuarioUuid: string;
  itens: {
    livroUuid: string;
    quantidade: number;
  }[];
  valorFrete: number;
  /** Opcional - se não fornecido, backend calculará a partir do catálogo (regra U6: preços validados no backend). */
  valorTotal?: number;
  /** UUID da cotação persistida no backend (preferencial). */
  cotacaoUuid?: string;
}

export interface IVendaResultado {
  uuid?: string;
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
