/**
 * Interfaces para módulo de Entrega/Frete
 * Sprint 3 - User Story 5 e 6
 */

export interface IEnderecoEntrega {
  rua: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface IEnderecoEntregaInput {
  rua: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface IEnderecoEntregaOutput {
  id: string;
  vendaUuid: string;
  tipoFrete: string;
  endereco: IEnderecoEntrega;
  custo: number;
  criadoEm: Date;
}

/** Opção de frete: `uuid` identifica a linha da cotação; `cotacaoUuid` é o id persistido para `POST /vendas`. */
export interface IFreteOpcao {
  uuid: string;
  /** Retornado por `POST /frete/cotar` — deve ser enviado em `cotacaoUuid` na venda. */
  cotacaoUuid?: string;
  tipo: 'PAC' | 'SEDEX' | 'RETIRA_EM_LOJA';
  valor: number;
  prazo: string;
  selecionado?: boolean;
}

export interface IFreteCalculoInput {
  cepDestino: string;
  peso?: number;
  valorTotal?: number;
}

export interface IFreteCalculoOutput {
  opcoes: IFreteOpcao[];
  cepOrigem?: string;
  pesoTotal?: number;
}

export interface IEntregaInputDto {
  vendaUuid: string;
  tipoFrete: string;
  endereco: IEnderecoEntregaInput;
  custo: number;
}

export interface IEntregaOutputDto {
  id: string;
  vendaUuid: string;
  tipoFrete: string;
  endereco: IEnderecoEntrega;
  custo: number;
  criadoEm: Date;
}
