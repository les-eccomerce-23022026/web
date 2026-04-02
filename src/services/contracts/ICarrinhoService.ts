import type { ICarrinho } from '@/interfaces/ICarrinho';

export interface ICarrinhoService {
  getCarrinho(): Promise<ICarrinho>;
  /** Define a quantidade total da linha no servidor (0 remove o item). */
  sincronizarItem(payload: { livroUuid: string; quantidade: number }): Promise<ICarrinho>;
  limparCarrinhoRemoto(): Promise<ICarrinho>;
}
