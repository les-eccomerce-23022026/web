import type { ICarrinho } from '../interfaces/carrinho';
import type { IFreteOpcao } from '../interfaces/entrega';
import type { AuthUser } from '../store/slices/authSlice';
import { CheckoutService } from '../services/checkoutService';
import { montarPayloadVenda } from './finalizarCompraPedido';
import { valorTotalPedidoSemCupons } from './cupomUtils';
import {
  montarLiquidaçõesEfetivasFinalizarCompra,
  totaisFinalizarCompraComFrete,
} from './finalizarCompraTotais';

type FreteSelecionado = IFreteOpcao | null | undefined;

export async function criarVendaCheckout(params: {
  carrinho: ICarrinho;
  usuario: AuthUser;
  cuponsAplicados: unknown[];
  parcelasLiquidacao: unknown[];
  freteSelecionado: FreteSelecionado;
  opcoes?: unknown;
}): Promise<{ vendaUuid: string; custoFreteNaVenda: number; subtotal: number; frete: number; pagamentosEfetivos: unknown[] }> {
  const {
    carrinho,
    usuario,
    cuponsAplicados,
    parcelasLiquidacao,
    freteSelecionado,
    opcoes,
  } = params;

  const frete = freteSelecionado?.valor ?? carrinho.resumo.frete;
  const { subtotal, total } = totaisFinalizarCompraComFrete(carrinho, frete, cuponsAplicados as any[]);
  const pagamentosEfetivos = montarLiquidaçõesEfetivasFinalizarCompra(opcoes as any, total, parcelasLiquidacao as any[]);

  const valorTotalPedido = valorTotalPedidoSemCupons(subtotal, frete);

  const payloadVenda = montarPayloadVenda(
    usuario,
    carrinho,
    frete,
    subtotal,
    valorTotalPedido,
    freteSelecionado ?? null,
  );

  const resultado = await CheckoutService.finalizarCompra(payloadVenda);
  const vendaUuid = resultado.id ?? resultado.ven_uuid;
  if (!vendaUuid) {
    throw new Error('Resposta da venda sem identificador.');
  }

  const custoFreteNaVenda =
    typeof resultado.frete === 'number' && !Number.isNaN(resultado.frete) ? resultado.frete : frete;

  return { vendaUuid, custoFreteNaVenda, subtotal, frete, pagamentosEfetivos };
}
