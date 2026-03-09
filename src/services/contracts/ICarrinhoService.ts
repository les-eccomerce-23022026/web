import type { ICarrinho } from '@/interfaces/ICarrinho';

export interface ICarrinhoService {
  getCarrinho(): Promise<ICarrinho>;
}
