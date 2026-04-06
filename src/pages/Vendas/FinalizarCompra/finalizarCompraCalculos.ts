import type { ICheckoutInfo } from '@/interfaces/checkout';
import type { ICarrinho } from '@/interfaces/carrinho';
import type { ICupomAplicado, ICartaoCreditoInput, IPagamentoParcial } from '@/interfaces/pagamento';
import { linhaPagamentoProntaParaLiquidacao } from '@/utils/finalizarCompraLinhasPagamento';
import type { IFreteOpcao } from '@/interfaces/entrega';
import type { IEnderecoEntregaInput } from '@/interfaces/entrega';
import { calcularDescontoCupons } from '@/utils/finalizarCompraCupomTotais';

export function enderecoFinalizarCompraDerivado(
  data: ICheckoutInfo,
  enderecoSelecionado: string | null,
): string | null {
  const semLista =
    !data.enderecosDisponiveis || data.enderecosDisponiveis.length === 0;
  if (semLista) return null;
  return enderecoSelecionado;
}

/** Monta o corpo de endereço para `POST /entregas` a partir do checkout. */
export function enderecoEntregaInputDeCheckout(
  data: ICheckoutInfo,
  enderecoSelecionadoUuid: string | null,
): IEnderecoEntregaInput | null {
  if (!data.enderecosDisponiveis || data.enderecosDisponiveis.length === 0) {
    return null;
  }
  if (!enderecoSelecionadoUuid) return null;
  const cliente = data.enderecosDisponiveis.find((e) => e.uuid === enderecoSelecionadoUuid);
  if (!cliente) return null;
  return {
    rua: cliente.logradouro,
    numero: cliente.numero,
    complemento: cliente.complemento,
    bairro: cliente.bairro,
    cidade: cliente.cidade,
    estado: cliente.estado,
    cep: cliente.cep.replace(/\D/g, ''),
  };
}

function valorFretePedido(
  freteSelecionado: IFreteOpcao | null,
  carrinho: ICarrinho | null | undefined,
  fallbackFrete: number,
): number {
  return freteSelecionado?.valor ?? carrinho?.resumo.frete ?? fallbackFrete;
}

export function calcularResumoPedidoFinalizarCompra(
  carrinho: ICarrinho | null | undefined,
  data: ICheckoutInfo,
  freteSelecionado: IFreteOpcao | null,
  cuponsAplicados: ICupomAplicado[],
  parcelasLiquidacao: IPagamentoParcial[],
) {
  const quantidadeItens =
    carrinho?.itens.reduce((acc, item) => acc + item.quantidade, 0) ?? 0;
  const subtotal = carrinho?.resumo.subtotal ?? 0;
  const frete = valorFretePedido(freteSelecionado, carrinho, data.resumoPedido.frete);
  const descontoCupons = calcularDescontoCupons(subtotal, cuponsAplicados);
  const total = subtotal + frete - descontoCupons;
  const valorPagoParcialmente = parcelasLiquidacao.reduce((acc, p) => acc + p.valor, 0);
  return {
    quantidadeItens,
    subtotal,
    frete,
    descontoCupons,
    total,
    valorPagoParcialmente,
  };
}

export function temFormaPagamentoFinalizarCompra(
  cuponsLen: number,
  parcelasLiquidacao: IPagamentoParcial[],
  novosCartoesPorLinha: Record<string, ICartaoCreditoInput>,
  cartaoSel: string | null,
  novoCart: ICartaoCreditoInput | null,
): boolean {
  if (cuponsLen > 0) return true;
  if (parcelasLiquidacao.length > 0) {
    return parcelasLiquidacao.every((p) => linhaPagamentoProntaParaLiquidacao(p, novosCartoesPorLinha));
  }
  return Boolean(cartaoSel) || Boolean(novoCart);
}

/** Tolerância para considerar saldo zerado (cupons cobriram o pedido). */
const EPS_SALDO_ZERADO = 0.005;
const EPS_PARCIAL = 0.021;

/**
 * O total do pedido (após cupons) está coberto por liquidações?
 * Alinhado a `montarLiquidaçõesEfetivasFinalizarCompra` + validação em `executarFinalizarCheckout`.
 */
export function pagamentoCobreSaldoFinalizarCompra(
  totalAposCupons: number,
  parcelasLiquidacao: IPagamentoParcial[],
  novosCartoesPorLinha: Record<string, ICartaoCreditoInput>,
  cartaoSelecionado: string | null,
  novoCartao: ICartaoCreditoInput | null,
): boolean {
  if (totalAposCupons <= EPS_SALDO_ZERADO) {
    return true;
  }
  const somaParciais = parcelasLiquidacao.reduce((s, p) => s + p.valor, 0);
  if (parcelasLiquidacao.length === 0) {
    return Boolean(cartaoSelecionado || novoCartao);
  }
  if (Math.abs(totalAposCupons - somaParciais) > EPS_PARCIAL) {
    return false;
  }
  return parcelasLiquidacao.every((p) => linhaPagamentoProntaParaLiquidacao(p, novosCartoesPorLinha));
}
