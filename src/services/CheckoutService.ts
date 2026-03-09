import checkoutMock from '@/mocks/checkoutMock.json';
import type { ICheckoutInfo } from '@/interfaces/ICheckout';
import { API_ENDPOINTS, USE_MOCK } from '@/config/apiConfig';
import { ApiClient } from './apiClient';

export class CheckoutService {
  static async getCheckoutInfo(): Promise<ICheckoutInfo> {
    if (USE_MOCK) {
      console.log('[Mock] Buscando dados de checkout.');
      return new Promise((resolve) => setTimeout(() => resolve(checkoutMock as ICheckoutInfo), 300));
    }

    return ApiClient.get<ICheckoutInfo>(API_ENDPOINTS.obterCheckoutInfo);
  }
}
