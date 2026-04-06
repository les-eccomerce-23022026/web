import type { ICheckoutInfo } from '@/interfaces/checkout';
import type { ICarrinho } from '@/interfaces/carrinho';
import type { ICupomAplicado } from '@/interfaces/pagamento';
import type { ICartaoCreditoInput } from '@/interfaces/pagamento';
import type { IFreteOpcao } from '@/interfaces/entrega';
import type { IEnderecoEntregaInput } from '@/interfaces/entrega';
import { calcularDescontoCupons } from '@/utils/checkoutCupomTotais';

export function enderecoFinalizarCompraDerivado(
  data: ICheckoutInfo,
  enderecoSelecionado: string | null,
): string | null {
  const semLista =
    !data.enderecosDisponiveis || data.enderecosDisponiveis.length === 0;
  return enderecoSelecionado ?? (semLista ? 'fallback' : null);
}

/** Monta o corpo de endereço para `POST /entregas` a partir do checkout. */
export function enderecoEntregaInputDeCheckout(
  data: ICheckoutInfo,
  enderecoSelecionadoUuid: string | null,
): IEnderecoEntregaInput | null {
  if (data.enderecosDisponiveis && data.enderecosDisponiveis.length > 0) {
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
  const e = data.enderecoEntrega;
  if (!e) return null;
  return {
    rua: e.logradouro,
    numero: e.numero ?? 'S/N',
    complemento: e.complemento ?? '',
    bairro: 'Centro',
    cidade: e.cidade,
    estado: e.estado,
    cep: e.cep.replace(/\D/g, ''),
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

export function temFormaPagamentoFinalizarCompra(
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

/** Tolerância para considerar saldo zerado (cupons cobriram o pedido). */
const EPS_SALDO_ZERADO = 0.005;
const EPS_PARCIAL = 0.021;

/**
 * O total do pedido (após cupons) está coberto por liquidações?
 * Alinhado a `montarPagamentosEfetivosCheckout` + validação em `executarFinalizarCheckout`.
 */
export function pagamentoCobreSaldoFinalizarCompra(
  totalAposCupons: number,
  pagamentosParciais: { cartaoUuid: string; valor: number }[],
  cartaoSelecionado: string | null,
  novoCartao: ICartaoCreditoInput | null,
): boolean {
  if (totalAposCupons <= EPS_SALDO_ZERADO) {
    return true;
  }
  const somaParciais = pagamentosParciais.reduce((s, p) => s + p.valor, 0);
  if (pagamentosParciais.length === 0) {
    return Boolean(cartaoSelecionado || novoCartao);
  }
  if (totalAposCupons - somaParciais <= EPS_PARCIAL) {
    return true;
  }
  return Boolean(cartaoSelecionado || novoCartao);
}
