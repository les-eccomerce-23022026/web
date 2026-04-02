import type { ICarrinho } from '@/interfaces/carrinho';

export function criarCarrinhoVazio(): ICarrinho {
  return {
    itens: [],
    fretePadrao: { valor: 15, prazo: '5 a 7 dias úteis' },
    resumo: { subtotal: 0, frete: 0, total: 0 },
  };
}
