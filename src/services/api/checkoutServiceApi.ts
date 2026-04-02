import type { ICheckoutInfo } from '@/interfaces/checkout';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';
import type { ICheckoutService, IVendaInput, IVendaResultado } from '@/services/contracts/checkoutService';

export class CheckoutServiceApi implements ICheckoutService {
  async getCheckoutInfo(): Promise<ICheckoutInfo> {
    return ApiClient.get<ICheckoutInfo>(API_ENDPOINTS.obterCheckoutInfo);
  }

  async finalizarCompra(dados: IVendaInput): Promise<IVendaResultado> {
    return ApiClient.post<IVendaResultado>(API_ENDPOINTS.criarVenda, dados);
  }
}
