import checkoutMock from '@/mocks/checkoutMock.json';
import type { ICheckoutInfo } from '@/interfaces/ICheckout';
import type { ICheckoutService, IVendaInput, IVendaResultado } from '@/services/contracts/ICheckoutService';

export class CheckoutServiceMock implements ICheckoutService {
  async getCheckoutInfo(): Promise<ICheckoutInfo> {
    console.log('[Mock] Buscando dados de checkout.');
    const normalized = {
      ...checkoutMock,
      cartoesSalvos: checkoutMock.cartoesSalvos.map(c => ({
        ...c,
        nomeImpresso: c.nomeCliente,
        validade: '12/2028'
      }))
    };
    return new Promise((resolve) =>
      setTimeout(() => resolve(normalized as ICheckoutInfo), 300),
    );
  }

  async finalizarCompra(dados: IVendaInput): Promise<IVendaResultado> {
    console.log('[Mock] Finalizando compra:', dados);
    return new Promise((resolve) =>
      setTimeout(() => resolve({ id: 'mock-uuid-venda', status: 'EM PROCESSAMENTO' }), 500),
    );
  }
}
