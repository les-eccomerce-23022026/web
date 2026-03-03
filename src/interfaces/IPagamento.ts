export interface IEnderecoCliente {
  uuid: string;
  apelido: string;
  tipoResidencia: string;
  tipoLogradouro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  pais: string;
}

export interface ICartaoCliente {
  uuid: string;
  final: string;
  nomeImpresso: string;
  bandeira: string;
  validade: string;
}

export interface ICupom {
  uuid: string;
  codigo: string;
  tipo: 'promocional' | 'troca';
  valor: number;
  descricao: string;
}

export interface IFreteOpcao {
  uuid: string;
  tipo: string;
  valor: number;
  prazo: string;
}

export interface IPagamentoCartao {
  cartaoUuid: string;
  valor: number;
}

export interface IPagamentoInfo {
  enderecosCliente: IEnderecoCliente[];
  cartoesCliente: ICartaoCliente[];
  cuponsDisponiveis: ICupom[];
  bandeirasPermitidas: string[];
  freteOpcoes: IFreteOpcao[];
}

export type StatusPagamento = 'idle' | 'processando' | 'aprovada' | 'reprovada';

export interface IPagamentoResumo {
  enderecoSelecionadoUuid: string | null;
  freteSelecionadoUuid: string | null;
  cuponsAplicados: ICupom[];
  pagamentosCartao: IPagamentoCartao[];
}
