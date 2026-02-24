import checkoutMock from '@/mocks/checkoutMock.json';
import type { CheckoutInfo } from '@/interfaces/Checkout';

export class CheckoutService {
  static async getCheckoutInfo(): Promise<CheckoutInfo> {
    return new Promise((resolve) => setTimeout(() => resolve(checkoutMock as CheckoutInfo), 300));
  }
}
