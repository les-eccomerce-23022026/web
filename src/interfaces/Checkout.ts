export interface EnderecoEntrega {
  logradouro: string;
  numero: string;
  complemento: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface CartaoSalvo {
  uuid: string;
  final: string;
  nomeCliente: string;
  bandeira: string;
}

export interface ResumoPedidoCheckout {
  quantidadeItens: number;
  subtotal: number;
  frete: number;
  descontoCupons: number;
  total: number;
}

export interface CheckoutInfo {
  enderecoEntrega: EnderecoEntrega;
  cartoesSalvos: CartaoSalvo[];
  resumoPedido: ResumoPedidoCheckout;
}
