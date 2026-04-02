import type { AppDispatch } from '@/store';
import { limparCarrinho, limparCarrinhoRemoto } from '@/store/slices/carrinhoSlice';
import { USE_MOCK } from '@/config/apiConfig';
import type { AuthUser } from '@/store/slices/authSlice';
import type { ICarrinho } from '@/interfaces/carrinho';
import type { ICupomAplicado } from '@/interfaces/pagamento';
import type { IVendaInput } from '@/services/contracts/checkoutService';

export async function limparCarrinhoAposPedido(dispatch: AppDispatch): Promise<void> {
  if (USE_MOCK) {
    dispatch(limparCarrinho());
    return;
  }
  try {
    await dispatch(limparCarrinhoRemoto()).unwrap();
  } catch {
    dispatch(limparCarrinho());
  }
}

export function montarPayloadVenda(
  usuario: AuthUser,
  carrinho: ICarrinho,
  frete: number,
  subtotal: number,
  total: number,
  cuponsAplicados: ICupomAplicado[],
  pagamentosEfetivos: { cartaoUuid: string; valor: number }[],
): IVendaInput {
  return {
    usuarioUuid: usuario.uuid,
    itens: carrinho.itens.map((it) => ({
      livroUuid: it.uuid,
      quantidade: it.quantidade,
      precoUnitario: it.precoUnitario,
    })),
    valorTotalItens: subtotal,
    valorFrete: frete,
    valorTotal: total,
    cuponsAplicados,
    pagamentos: pagamentosEfetivos,
  };
}
