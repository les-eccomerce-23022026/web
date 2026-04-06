import type {
  ICupomDisponivel,
  IFreteOpcao,
  IEnderecoCliente,
  ICupomAplicado,
  IPoliticaParcelamentoCartao,
} from './pagamento';

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
  ultimosDigitosCartao: string;
  nomeCliente: string;
  nomeImpresso: string;
  bandeira: string;
  validade: string;
  principal?: boolean;
}

export interface IResumoPedidoCheckout {
  quantidadeItens: number;
  subtotal: number;
  frete: number;
  descontoCupons: number;
  total: number;
}

/**
 * Interface completa de Checkout com integração backend
 * Inclui dados de pagamento, entrega e resumo do pedido
 */
export interface ICheckoutInfo {
  /** Espelho do primeiro endereço quando há lista; `null` se o cliente não tiver endereços cadastrados. */
  enderecoEntrega: IEnderecoEntrega | null;
  
  // Endereços disponíveis do cliente
  enderecosDisponiveis?: IEnderecoCliente[];
  
  // Cartões salvos do cliente
  cartoesSalvos: ICartaoSalvo[];
  
  // Cupons disponíveis para aplicação
  cuponsDisponiveis?: ICupomDisponivel[];
  
  // Opções de frete disponíveis
  freteOpcoes?: IFreteOpcao[];
  
  // Cupons já aplicados
  cuponsAplicados?: ICupomAplicado[];
  
  // Resumo financeiro do pedido
  resumoPedido: IResumoPedidoCheckout;
  
  // Bandeiras de cartão permitidas
  bandeirasPermitidas?: string[];

  /** Política de parcelamento (até Nx sem juros / com juros) vinda de `GET /pagamento/info`. */
  politicaParcelamentoCartao?: IPoliticaParcelamentoCartao;
}
