import type { ICarrinho } from '../interfaces/carrinho';
import type { IFreteOpcao } from '../interfaces/entrega';
import type { AuthUser } from '../store/slices/authSlice';
import type { ICupomAplicado, IPagamentoParcial } from '../interfaces/pagamento';
import { CheckoutService } from '../services/checkoutService';
import { montarPayloadVenda } from './finalizarCompraPedido';
import { valorTotalPedidoSemCupons } from './cupomUtils';
import {
  montarLiquidaçõesEfetivasFinalizarCompra,
  totaisFinalizarCompraComFrete,
} from './finalizarCompraTotais';
import type { OpcoesFinalizarCheckout } from '../types/checkout';

type FreteSelecionado = IFreteOpcao | null | undefined;

export async function criarVendaCheckout(params: {
  carrinho: ICarrinho;
  usuario: AuthUser;
  cuponsAplicados: ICupomAplicado[];
  parcelasLiquidacao: IPagamentoParcial[];
  freteSelecionado: FreteSelecionado;
  opcoes?: OpcoesFinalizarCheckout;
}): Promise<{ vendaUuid: string; custoFreteNaVenda: number; subtotal: number; frete: number; pagamentosEfetivos: IPagamentoParcial[] }> {
  const {
    carrinho,
    usuario,
    cuponsAplicados,
    parcelasLiquidacao,
    freteSelecionado,
    opcoes,
  } = params;

  const frete = freteSelecionado?.valor ?? carrinho.resumo.frete;
  const { subtotal, total } = totaisFinalizarCompraComFrete(carrinho, frete, cuponsAplicados);
  const pagamentosEfetivos = montarLiquidaçõesEfetivasFinalizarCompra(opcoes, total, parcelasLiquidacao);

  const payloadVenda = montarPayloadVenda(
    usuario,
    carrinho,
    frete,
    freteSelecionado ?? null,
  );

  const resultado = await CheckoutService.finalizarCompra(payloadVenda);
  const vendaUuid = resultado.uuid;
  if (!vendaUuid) {
    throw new Error('Resposta da venda sem identificador.');
  }

  const custoFreteNaVenda =
    typeof resultado.frete === 'number' && !Number.isNaN(resultado.frete) ? resultado.frete : frete;

  return { vendaUuid, custoFreteNaVenda, subtotal, frete, pagamentosEfetivos };
}
