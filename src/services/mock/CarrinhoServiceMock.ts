import carrinhoMock from '@/mocks/carrinhoMock.json';
import type { ICarrinho } from '@/interfaces/ICarrinho';
import type { ICarrinhoService } from '@/services/contracts/ICarrinhoService';
import { criarCarrinhoVazio } from '@/utils/carrinhoVazio';

export class CarrinhoServiceMock implements ICarrinhoService {
  async getCarrinho(): Promise<ICarrinho> {
    console.log('[Mock] Buscando dados de carrinho.');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(carrinhoMock as ICarrinho);
      }, 300);
    });
  }

  async sincronizarItem(_payload: { livroUuid: string; quantidade: number }): Promise<ICarrinho> {
    return this.getCarrinho();
  }

  async limparCarrinhoRemoto(): Promise<ICarrinho> {
    return Promise.resolve(criarCarrinhoVazio());
  }
}
