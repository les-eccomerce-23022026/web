import carrinhoMock from '@/mocks/carrinhoMock.json';
import type { ICarrinho } from '@/interfaces/ICarrinho';
import { API_ENDPOINTS } from '@/config/apiConfig';

export class CarrinhoService {
  static async getCarrinho(): Promise<ICarrinho> {
    // Simula uma chamada de API (atraso de rede)
    // Exemplo para integração futura:
    // const response = await fetch(API_ENDPOINTS.obterCarrinho);
    // return response.json();
    console.log('[Mock] Buscando dados de carrinho. Endpoint real seria:', API_ENDPOINTS.obterCarrinho);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(carrinhoMock as ICarrinho);
      }, 300);
    });
  }
}
