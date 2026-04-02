import type { ICheckoutInfo } from '@/interfaces/ICheckout';
import type { ICarrinho } from '@/interfaces/ICarrinho';
import type { ICupomAplicado } from '@/interfaces/IPagamento';
import type { ICartaoCreditoInput } from '@/interfaces/IPagamento';
import type { IFreteOpcao } from '@/interfaces/IPagamento';
import { calcularDescontoCupons } from '@/utils/checkoutCupomTotais';

export function enderecoParaCheckoutDerivado(
  data: ICheckoutInfo,
  enderecoSelecionado: string | null,
): string | null {
  const semLista =
    !data.enderecosDisponiveis || data.enderecosDisponiveis.length === 0;
  return enderecoSelecionado ?? (semLista ? 'fallback' : null);
}

function valorFretePedido(
  freteSelecionado: IFreteOpcao | null,
  carrinho: ICarrinho | null | undefined,
  fallbackFrete: number,
): number {
  return freteSelecionado?.valor ?? carrinho?.resumo.frete ?? fallbackFrete;
}

export function calcularResumoPedidoCheckout(
  carrinho: ICarrinho | null | undefined,
  data: ICheckoutInfo,
  freteSelecionado: IFreteOpcao | null,
  cuponsAplicados: ICupomAplicado[],
  pagamentosParciais: { cartaoUuid: string; valor: number }[],
) {
  const quantidadeItens =
    carrinho?.itens.reduce((acc, item) => acc + item.quantidade, 0) ?? 0;
  const subtotal = carrinho?.resumo.subtotal ?? 0;
  const frete = valorFretePedido(freteSelecionado, carrinho, data.resumoPedido.frete);
  const descontoCupons = calcularDescontoCupons(subtotal, cuponsAplicados);
  const total = subtotal + frete - descontoCupons;
  const valorPagoParcialmente = pagamentosParciais.reduce((acc, p) => acc + p.valor, 0);
  return {
    quantidadeItens,
    subtotal,
    frete,
    descontoCupons,
    total,
    valorPagoParcialmente,
  };
}

export function temFormaPagamentoCheckout(
  cuponsLen: number,
  pagParciaisLen: number,
  cartaoSel: string | null,
  novoCart: ICartaoCreditoInput | null,
): boolean {
  return (
    cuponsLen > 0 ||
    pagParciaisLen > 0 ||
    Boolean(cartaoSel) ||
    Boolean(novoCart)
  );
}
