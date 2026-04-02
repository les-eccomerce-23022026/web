import type {
  ICupomDisponivel,
  IFreteOpcao,
  IEnderecoCliente,
  ICupomAplicado
} from './IPagamento';

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
  // Endereço de entrega (pode vir do perfil do cliente)
  enderecoEntrega: IEnderecoEntrega;
  
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
}
