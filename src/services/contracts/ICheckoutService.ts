import type { ICheckoutInfo } from '@/interfaces/ICheckout';

export interface ICheckoutService {
  getCheckoutInfo(): Promise<ICheckoutInfo>;
}
