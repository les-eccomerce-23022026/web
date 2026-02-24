import carrinhoMock from '@/mocks/carrinhoMock.json';

export class CarrinhoService {
  static async getCarrinho(): Promise<any> {
    // Simula uma chamada de API (atraso de rede)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(carrinhoMock);
      }, 300);
    });
  }
}
