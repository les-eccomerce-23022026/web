export type RemetenteMensagem = 'usuario' | 'assistente';

export interface IMensagemChat {
  id: string;
  conteudo: string;
  remetente: RemetenteMensagem;
  timestamp: Date;
}

export interface IHistoricoMensagem {
  remetente: RemetenteMensagem;
  conteudo: string;
}

export interface IRequisicaoChat {
  mensagem: string;
  historico: IHistoricoMensagem[];
}

export interface IRespostaChat {
  resposta: string;
}
