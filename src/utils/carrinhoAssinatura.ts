import type { ICarrinho } from '@/interfaces/carrinho';

/** Assinatura estável do conteúdo do carrinho para invalidar frete/cotação. */
export function assinaturaItensCarrinho(carrinho: ICarrinho | null | undefined): string {
  if (!carrinho?.itens?.length) return '';
  return carrinho.itens.map((i) => `${i.uuid}:${i.quantidade}`).join('|');
}
