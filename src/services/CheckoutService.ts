import checkoutMock from '@/mocks/checkoutMock.json';
import type { ICheckoutInfo } from '@/interfaces/ICheckout';
import { API_ENDPOINTS } from '@/config/apiConfig';

export class CheckoutService {
  static async getCheckoutInfo(): Promise<ICheckoutInfo> {
    // Simula chamada de API
    // Exemplo futuro: const response = await fetch(API_ENDPOINTS.obterCheckoutInfo);
    console.log('[Mock] Buscando dados de checkout. Endpoint real seria:', API_ENDPOINTS.obterCheckoutInfo);
    return new Promise((resolve) => setTimeout(() => resolve(checkoutMock as ICheckoutInfo), 300));
  }
}
