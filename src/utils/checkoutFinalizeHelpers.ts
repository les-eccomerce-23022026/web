import type { ICarrinho } from '@/interfaces/carrinho';
import type { ICupomAplicado } from '@/interfaces/pagamento';
import type { OpcoesFinalizarCheckout } from '@/types/checkout';
import { calcularDescontoCupons } from '@/utils/checkoutCupomTotais';

export function totaisCheckoutComFrete(
  carrinho: ICarrinho,
  freteValor: number,
  cupons: ICupomAplicado[],
) {
  const subtotal = carrinho.resumo.subtotal;
  const descontoCupons = calcularDescontoCupons(subtotal, cupons);
  const total = subtotal + freteValor - descontoCupons;
  return { subtotal, frete: freteValor, descontoCupons, total };
}

export function montarPagamentosEfetivosCheckout(
  opcoes: OpcoesFinalizarCheckout | undefined,
  total: number,
  pagamentosParciais: { cartaoUuid: string; valor: number }[],
): { cartaoUuid: string; valor: number }[] {
  let pagamentosEfetivos = [...pagamentosParciais];
  if (pagamentosEfetivos.length === 0 && total > 0) {
    if (opcoes?.cartaoSalvoUuid) {
      pagamentosEfetivos = [{ cartaoUuid: opcoes.cartaoSalvoUuid, valor: total }];
    } else if (opcoes?.novoCartao) {
      pagamentosEfetivos = [{ cartaoUuid: 'novo', valor: total }];
    }
  }
  return pagamentosEfetivos;
}
