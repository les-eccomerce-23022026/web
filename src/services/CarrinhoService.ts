import carrinhoMock from '@/mocks/carrinhoMock.json';
import type { Carrinho } from '@/interfaces/Carrinho';

export class CarrinhoService {
  static async getCarrinho(): Promise<Carrinho> {
    // Simula uma chamada de API (atraso de rede)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(carrinhoMock as Carrinho);
      }, 300);
    });
  }
}
