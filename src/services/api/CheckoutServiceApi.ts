import type { ICheckoutInfo } from '@/interfaces/ICheckout';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';
import type { ICheckoutService } from '@/services/contracts/ICheckoutService';

export class CheckoutServiceApi implements ICheckoutService {
  async getCheckoutInfo(): Promise<ICheckoutInfo> {
    return ApiClient.get<ICheckoutInfo>(API_ENDPOINTS.obterCheckoutInfo);
  }
}
