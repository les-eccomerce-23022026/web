/**
 * Interfaces para módulo de Pagamento
 * Sprint 2 - User Story 3 e 4
 */

export type TipoPagamento = 'cartao_credito' | 'cupom_troca' | 'cupom_promocional';
export type StatusPagamento = 'pendente' | 'aprovado' | 'recusado' | 'cancelado';

export interface IBandeiraCartao {
  id: number;
  nome: string;
  imagem?: string;
}

export interface ICartaoSalvoPagamento {
  uuid: string;
  ultimosDigitosCartao: string;
  nomeCliente: string;
  nomeImpresso: string;
  bandeira: string;
  validade: string;
  principal?: boolean;
}

export interface ICartaoCreditoInput {
  numero: string;
  nomeTitular: string;
  validade: string; // MM/AA
  cvv: string;
  bandeira: string;
  salvarCartao?: boolean;
}

export interface ICupomDisponivel {
  uuid: string;
  codigo: string;
  tipo: 'promocional' | 'troca';
  valor: number;
  descricao: string;
  valido?: boolean;
}

export interface ICupomAplicado {
  uuid: string;
  codigo: string;
  tipo: 'promocional' | 'troca';
  valor: number;
}

export interface IFreteOpcao {
  uuid: string;
  tipo: 'PAC' | 'SEDEX' | 'RETIRA_EM_LOJA';
  valor: number;
  prazo: string;
  selecionado?: boolean;
}

export interface IPagamentoInfo {
  enderecosCliente: IEnderecoCliente[];
  cartoesCliente: ICartaoSalvoPagamento[];
  cuponsDisponiveis: ICupomDisponivel[];
  bandeirasPermitidas: string[];
  freteOpcoes: IFreteOpcao[];
}

export interface IEnderecoCliente {
  uuid: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  tipo: 'cobranca' | 'entrega' | 'ambos';
  principal?: boolean;
}

export interface IPagamentoSelecionado {
  tipo: TipoPagamento;
  cartao?: ICartaoCreditoInput | ICartaoSalvoPagamento;
  cupons?: ICupomAplicado[];
}

export interface IPagamentoParcial {
  cartaoUuid: string;
  valor: number;
}

export interface IProcessarPagamentoInput {
  vendaUuid: string;
  pagamentosCartao: IPagamentoParcial[];
  cuponsAplicados: ICupomAplicado[];
  valorTotal: number;
}

export interface IProcessarPagamentoResultado {
  sucesso: boolean;
  pedidoUuid: string;
  status: StatusPagamento;
  mensagem?: string;
}

export interface IPagamentoDetalhes {
  id: string;
  vendaUuid: string;
  valor: number;
  formaPagamento: {
    tipo: TipoPagamento;
    detalhes?: string;
  };
  cartao?: {
    numeroTokenizado: string;
    nomeTitular: string;
    validade: string;
    bandeira: string;
  };
  status: StatusPagamento;
  criadoEm: Date;
  processadoEm?: Date;
}
