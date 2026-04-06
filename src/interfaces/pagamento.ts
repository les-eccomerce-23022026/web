/**
 * Interfaces para módulo de Pagamento
 * Sprint 2 - User Story 3 e 4
 */

export type TipoPagamento = 'cartao_credito' | 'cupom_troca' | 'cupom_promocional' | 'pix';

/** Máximo de parcelas no cartão (checkout). */
export const PARCELAS_CARTAO_MAX = 12;

/** Política de parcelamento no cartão (`GET /pagamento/info` → checkout). */
export interface IPoliticaParcelamentoCartao {
  parcelasMaximas: number;
  parcelasSemJuros: number;
}

/** Fallback quando a API não envia política (alinhado ao backend). */
export const POLITICA_PARCELAMENTO_CARTAO_PADRAO: IPoliticaParcelamentoCartao = {
  parcelasMaximas: PARCELAS_CARTAO_MAX,
  parcelasSemJuros: 6,
};

/** Corpo alinhado a `POST /pagamentos/selecionar` no backend. */
export interface ISelecionarPagamentoLiquidaBody {
  vendaUuid: string;
  valor: number;
  tipoPagamento: TipoPagamento;
  detalhesCupom?: string;
  /** 1..PARCELAS_CARTAO_MAX; apenas para cartão de crédito. */
  parcelasCartao?: number;
  cartao?: {
    numero: string;
    nomeTitular: string;
    validade: string;
    bandeira: string;
  };
}
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
  /** Alinhado a `POST /frete/cotar` — usar em `POST /vendas.cotacaoUuid` quando presente. */
  cotacaoUuid?: string;
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
  politicaParcelamentoCartao?: IPoliticaParcelamentoCartao;
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

/** Parcela de liquidação no checkout (UUID de cartão salvo, prefixos novo:/pix:, ou atalho "novo"). */
export interface IPagamentoParcial {
  referenciaMeioPagamento: string;
  valor: number;
  /** Parcelamento da operação no cartão (1 = à vista). Ignorado para PIX. */
  parcelasCartao?: number;
}

/** Resposta de POST /pagamentos/intencao-pagamento — valor travado no provedor. */
export interface IIntencaoPagamentoResultado {
  idIntencao: string;
  segredoConfirmacao: string;
}

export interface IProcessarPagamentoInput {
  vendaUuid: string;
  pagamentosCartao: IPagamentoParcial[];
  cuponsAplicados: ICupomAplicado[];
  valorTotal: number;
  idIntencao: string;
  segredoConfirmacao: string;
}

export interface IProcessarPagamentoResultado {
  sucesso: boolean;
  pedidoUuid: string;
  status: StatusPagamento;
  mensagem?: string;
}

/** Cobrança PIX simulada (backend). */
export interface IPixCobrancaSimulada {
  copiaCola: string;
  qrCodeBase64: string | null;
  expiraEm: string;
  segredoConfirmacao: string;
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
  pixCobranca?: IPixCobrancaSimulada;
}

/** Polling GET /pagamentos/venda/:vendaUuid/resumo */
export interface IResumoPagamentosVenda {
  vendaStatus: string;
  aguardandoPix: boolean;
  pagamentos: Array<{
    id: string;
    tipo: TipoPagamento;
    status: StatusPagamento;
    valor: number;
    pixExpiraEm?: string;
  }>;
}
