import checkoutMock from '@/mocks/checkoutMock.json';
import type { ICheckoutInfo } from '@/interfaces/ICheckout';
import type { ICheckoutService } from '@/services/contracts/ICheckoutService';

export class CheckoutServiceMock implements ICheckoutService {
  async getCheckoutInfo(): Promise<ICheckoutInfo> {
    console.log('[Mock] Buscando dados de checkout.');
    return new Promise((resolve) =>
      setTimeout(() => resolve(checkoutMock as ICheckoutInfo), 300),
    );
  }
}
