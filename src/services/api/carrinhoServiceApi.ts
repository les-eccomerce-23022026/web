import type { ICarrinho } from '@/interfaces/carrinho';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';
import type { ICarrinhoService } from '@/services/contracts/carrinhoService';

export class CarrinhoServiceApi implements ICarrinhoService {
  async getCarrinho(): Promise<ICarrinho> {
    return ApiClient.get<ICarrinho>(API_ENDPOINTS.obterCarrinho);
  }

  async sincronizarItem(payload: { livroUuid: string; quantidade: number }): Promise<ICarrinho> {
    return ApiClient.post<ICarrinho>(API_ENDPOINTS.sincronizarCarrinhoItem, payload);
  }

  async limparCarrinhoRemoto(): Promise<ICarrinho> {
    return ApiClient.delete<ICarrinho>(API_ENDPOINTS.obterCarrinho);
  }
}
