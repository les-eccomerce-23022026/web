import carrinhoMock from '@/mocks/carrinhoMock.json';
import type { ICarrinho } from '@/interfaces/ICarrinho';
import { API_ENDPOINTS, USE_MOCK } from '@/config/apiConfig';

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

    const response = await fetch(API_ENDPOINTS.obterCarrinho);
    if (!response.ok) throw new Error('Erro ao buscar dados do carrinho');
    return response.json();
  }
}
