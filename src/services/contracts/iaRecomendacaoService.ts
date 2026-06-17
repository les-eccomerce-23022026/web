import type {
  IRequisicaoChat,
  IRespostaChat,
  ICallbacksChatStream,
} from '@/interfaces/iaRecomendacao';

export interface IIaRecomendacaoService {
  enviarMensagem(requisicao: IRequisicaoChat): Promise<IRespostaChat>;
  /**
   * Envia a mensagem consumindo a resposta via SSE (streaming incremental).
   * Faz fallback automático para `enviarMensagem` quando o backend responde
   * JSON normal (não-SSE) ou quando streaming não está disponível.
   */
  enviarMensagemStream(
    requisicao: IRequisicaoChat,
    callbacks: ICallbacksChatStream,
    signal?: AbortSignal
  ): Promise<void>;
  verificarSaude(): Promise<{ status: string; servico: string; timestamp: string }>;
}
