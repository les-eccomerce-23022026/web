import { ApiClient } from '../apiClient';
import { API_ENDPOINTS } from '@/config/apiConfig';
import type { IIaRecomendacaoService } from '../contracts/iaRecomendacaoService';
import type { IRequisicaoChat, IRespostaChat } from '@/interfaces/iaRecomendacao';

export class IaRecomendacaoServiceApi implements IIaRecomendacaoService {
  async enviarMensagem(requisicao: IRequisicaoChat): Promise<IRespostaChat> {
    return ApiClient.post<IRespostaChat>(API_ENDPOINTS.chatRecomendacao, requisicao);
  }
}
