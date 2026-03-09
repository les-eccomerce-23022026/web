import carrinhoMock from '@/mocks/carrinhoMock.json';
import type { ICarrinho } from '@/interfaces/ICarrinho';
import type { ICarrinhoService } from '@/services/contracts/ICarrinhoService';

export class CarrinhoServiceMock implements ICarrinhoService {
  async getCarrinho(): Promise<ICarrinho> {
    console.log('[Mock] Buscando dados de carrinho.');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(carrinhoMock as ICarrinho);
      }, 300);
    });
  }
}
