import checkoutMock from '@/mocks/checkoutMock.json';

export class CheckoutService {
  static async getCheckoutInfo(): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve(checkoutMock), 300));
  }
}
