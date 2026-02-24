import checkoutMock from '@/mocks/checkoutMock.json';
import type { ICheckoutInfo } from '@/interfaces/ICheckout';
import { API_ENDPOINTS, USE_MOCK } from '@/config/apiConfig';

export class CheckoutService {
  static async getCheckoutInfo(): Promise<ICheckoutInfo> {
    if (USE_MOCK) {
      console.log('[Mock] Buscando dados de checkout.');
      return new Promise((resolve) => setTimeout(() => resolve(checkoutMock as ICheckoutInfo), 300));
    }

    const response = await fetch(API_ENDPOINTS.obterCheckoutInfo);
    if (!response.ok) throw new Error('Erro ao buscar dados do checkout');
    return response.json();
  }
}
