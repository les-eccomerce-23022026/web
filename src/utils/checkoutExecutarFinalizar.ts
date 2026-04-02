import type { NavigateFunction } from 'react-router-dom';
import type { AppDispatch } from '@/store';
import type { AuthUser } from '@/store/slices/authSlice';
import type { ICarrinho } from '@/interfaces/carrinho';
import type { ICupomAplicado } from '@/interfaces/pagamento';
import { CheckoutService } from '@/services/checkoutService';
import { limparCarrinhoAposPedido, montarPayloadVenda } from '@/utils/checkoutFinalizarPedido';
import { totaisCheckoutComFrete, montarPagamentosEfetivosCheckout } from '@/utils/checkoutFinalizeHelpers';
import { garantirAutorizacaoPagamentoSeNecessario } from '@/utils/checkoutFinalizarFluxo';
import type { OpcoesFinalizarCheckout } from '@/types/checkout';
import type { IProcessarPagamentoResultado } from '@/interfaces/pagamento';

type FreteSelecionado = { valor: number } | null | undefined;

type SolicitarAutorizacao = (
  vendaUuid: string,
  valorTotal: number,
  pagamentosOverride?: { cartaoUuid: string; valor: number }[],
) => Promise<IProcessarPagamentoResultado | null>;

export async function executarFinalizarCheckout(params: {
  carrinho: ICarrinho;
  usuario: AuthUser;
  cuponsAplicados: ICupomAplicado[];
  pagamentosParciais: { cartaoUuid: string; valor: number }[];
  freteSelecionado: FreteSelecionado;
  opcoes?: OpcoesFinalizarCheckout;
  solicitarAutorizacaoFinanceiraCheckout: SolicitarAutorizacao;
  dispatch: AppDispatch;
  navigate: NavigateFunction;
}): Promise<void> {
  const {
    carrinho,
    usuario,
    cuponsAplicados,
    pagamentosParciais,
    freteSelecionado,
    opcoes,
    solicitarAutorizacaoFinanceiraCheckout,
    dispatch,
    navigate,
  } = params;

  const frete = freteSelecionado?.valor ?? carrinho.resumo.frete;
  const { subtotal, total } = totaisCheckoutComFrete(carrinho, frete, cuponsAplicados);
  const pagamentosEfetivos = montarPagamentosEfetivosCheckout(opcoes, total, pagamentosParciais);

  if (total > 0 && pagamentosEfetivos.length === 0) {
    throw new Error('Selecione uma forma de pagamento');
  }

  const vendaUuid = crypto.randomUUID();

  await garantirAutorizacaoPagamentoSeNecessario(
    total,
    pagamentosEfetivos,
    vendaUuid,
    solicitarAutorizacaoFinanceiraCheckout,
  );

  const payload = montarPayloadVenda(
    usuario,
    carrinho,
    frete,
    subtotal,
    total,
    cuponsAplicados,
    pagamentosEfetivos,
  );

  const resultado = await CheckoutService.finalizarCompra(payload);

  await limparCarrinhoAposPedido(dispatch);
  navigate(`/pedido-confirmado?pedido=${resultado.id || resultado.ven_uuid || 'sucesso'}`);
}

export function tratarErroFinalizarCheckout(err: unknown, setError: (e: Error) => void): void {
  const mensagem = err instanceof Error ? err.message : 'Erro desconhecido ao finalizar compra';
  setError(new Error(mensagem));
  alert('Erro ao finalizar compra: ' + mensagem);
}
