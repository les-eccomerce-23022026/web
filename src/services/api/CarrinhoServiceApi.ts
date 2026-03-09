import type { ICarrinho } from '@/interfaces/ICarrinho';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';
import type { ICarrinhoService } from '@/services/contracts/ICarrinhoService';

export class CarrinhoServiceApi implements ICarrinhoService {
  async getCarrinho(): Promise<ICarrinho> {
    return ApiClient.get<ICarrinho>(API_ENDPOINTS.obterCarrinho);
  }
}
