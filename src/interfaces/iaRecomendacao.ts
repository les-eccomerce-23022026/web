export type RemetenteMensagem = 'usuario' | 'assistente';

export type TipoRespostaChat =
  | 'recomendacao'
  | 'esclarecimento'
  | 'pos_venda'
  | 'tendencias';

export interface IProdutoRecomendado {
  uuid: string;
  titulo: string;
  autor: string;
  categoria: string;
  sinopse: string;
  isbn: string;
  preco: number;
  similaridade: number;
  motivo: string;
}

export interface IMensagemChat {
  id: string;
  conteudo: string;
  remetente: RemetenteMensagem;
  timestamp: Date;
  produtosRecomendados?: IProdutoRecomendado[];
  contextoUsado?: boolean;
  tipoResposta?: TipoRespostaChat;
  perguntasFollowUp?: string[];
  /** Resumo determinístico da intenão (backend) — rótulo do histórico. */
  intencaoResumida?: string;
  /** Turno da conversa retornado pela API. */
  numeroTurno?: number;
}

export interface IProdutoMencionadoHistorico {
  uuid: string;
  titulo: string;
}

export interface IHistoricoMensagem {
  remetente: RemetenteMensagem;
  conteudo: string;
  produtosMencionados?: IProdutoMencionadoHistorico[];
}

export interface IRequisicaoChat {
  mensagem: string;
  historico: IHistoricoMensagem[];
  clienteUuid?: string;
}

export interface IMetricasChat {
  tempoRespostaMs?: number;
  tokensEntrada?: number;
  tokensSaida?: number;
}

export interface IRespostaChat {
  resposta: string;
  produtosRecomendados?: IProdutoRecomendado[];
  contextoUsado?: boolean;
  tempoRespostaMs?: number;
  tipoResposta?: TipoRespostaChat;
  numeroTurno?: number;
  perguntasFollowUp?: string[];
  intencaoResumida?: string;
  metricas?: IMetricasChat;
}

/** Payload do evento SSE `meta` emitido pelo backend antes do streaming de tokens. */
export interface IMetaChatStream {
  tipoResposta?: TipoRespostaChat;
  intencaoResumida?: string;
  contextoUsado?: boolean;
  numeroTurno?: number;
}

/** Payload do evento SSE `produtos`. */
export interface IProdutosChatStream {
  produtosRecomendados: IProdutoRecomendado[];
}

/** Payload do evento SSE `token` (delta incremental do texto). */
export interface IDeltaChatStream {
  delta: string;
}

/** Callbacks tipados para consumo do streaming SSE do chat. */
export interface ICallbacksChatStream {
  onMeta?: (meta: IMetaChatStream) => void;
  onProdutos?: (produtos: IProdutoRecomendado[]) => void;
  onDelta?: (delta: string) => void;
  onDone?: (resposta: IRespostaChat) => void;
  onError?: (mensagem: string) => void;
}
