export interface IEnderecoEntrega {
  logradouro: string;
  numero: string;
  complemento: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface ICartaoSalvo {
  uuid: string;
  final: string;
  nomeCliente: string;
  bandeira: string;
}

export interface IResumoPedidoCheckout {
  quantidadeItens: number;
  subtotal: number;
  frete: number;
  descontoCupons: number;
  total: number;
}

export interface ICheckoutInfo {
  enderecoEntrega: IEnderecoEntrega;
  cartoesSalvos: ICartaoSalvo[];
  resumoPedido: IResumoPedidoCheckout;
}
