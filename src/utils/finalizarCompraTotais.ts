import type { ICarrinho } from '@/interfaces/carrinho';
import type { ICupomAplicado, IPagamentoParcial } from '@/interfaces/pagamento';
import type { OpcoesFinalizarCheckout } from '@/types/checkout';
import { calcularDescontoCupons } from '@/utils/finalizarCompraCupomTotais';

export function totaisFinalizarCompraComFrete(
  carrinho: ICarrinho,
  freteValor: number,
  cupons: ICupomAplicado[],
) {
  const subtotal = carrinho.resumo.subtotal;
  const descontoCupons = calcularDescontoCupons(subtotal, cupons);
  const total = subtotal + freteValor - descontoCupons;
  return { subtotal, frete: freteValor, descontoCupons, total };
}

export function montarLiquidaçõesEfetivasFinalizarCompra(
  opcoes: OpcoesFinalizarCheckout | undefined,
  total: number,
  parcelasLiquidacao: IPagamentoParcial[],
): IPagamentoParcial[] {
  let pagamentosEfetivos = [...parcelasLiquidacao];
  if (pagamentosEfetivos.length === 0 && total > 0) {
    if (opcoes?.cartaoSalvoUuid) {
      pagamentosEfetivos = [
        { referenciaMeioPagamento: opcoes.cartaoSalvoUuid, valor: total, parcelasCartao: 1 },
      ];
    } else if (opcoes?.novoCartao) {
      pagamentosEfetivos = [{ referenciaMeioPagamento: 'novo', valor: total, parcelasCartao: 1 }];
    }
  }
  return pagamentosEfetivos;
}
