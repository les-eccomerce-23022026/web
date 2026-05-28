import type { IRequisicaoChat, IRespostaChat } from '@/interfaces/iaRecomendacao';

export interface IIaRecomendacaoService {
  enviarMensagem(requisicao: IRequisicaoChat): Promise<IRespostaChat>;
}
