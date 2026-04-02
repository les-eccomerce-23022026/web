/**
 * Factory de CheckoutService.
 *
 * Seleciona automaticamente a implementação correta:
 * - VITE_USE_MOCK=true  → CheckoutServiceMock
 * - VITE_USE_MOCK=false → CheckoutServiceApi
 */
import { USE_MOCK } from '@/config/apiConfig';
import { CheckoutServiceMock } from '@/services/mock/checkoutServiceMock';
import { CheckoutServiceApi } from '@/services/api/checkoutServiceApi';
import type { ICheckoutService } from '@/services/contracts/checkoutService';

export const CheckoutService: ICheckoutService = USE_MOCK
  ? new CheckoutServiceMock()
  : new CheckoutServiceApi();

export type { ICheckoutService };
