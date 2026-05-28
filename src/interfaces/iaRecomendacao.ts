export type RemetenteMensagem = 'usuario' | 'assistente';

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
}

export interface IHistoricoMensagem {
  remetente: RemetenteMensagem;
  conteudo: string;
}

export interface IRequisicaoChat {
  mensagem: string;
  historico: IHistoricoMensagem[];
  clienteUuid?: string;
}

export interface IRespostaChat {
  resposta: string;
  produtosRecomendados?: IProdutoRecomendado[];
  contextoUsado?: boolean;
  tempoRespostaMs?: number;
}
