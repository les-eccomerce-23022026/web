import carrinhoMock from '@/mocks/carrinhoMock.json';
import type { ICarrinho } from '@/interfaces/ICarrinho';
import { API_ENDPOINTS, USE_MOCK } from '@/config/apiConfig';
import { ApiClient } from './apiClient';

export class CarrinhoService {
  static async getCarrinho(): Promise<ICarrinho> {
    if (USE_MOCK) {
      console.log('[Mock] Buscando dados de carrinho.');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(carrinhoMock as ICarrinho);
        }, 300);
      });
    }

    return ApiClient.get<ICarrinho>(API_ENDPOINTS.obterCarrinho);
  }
}
