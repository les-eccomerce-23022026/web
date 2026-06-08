import type { AppDispatch } from '../store/index';
import { limparCarrinho, limparCarrinhoRemoto } from '../store/slices/carrinhoSlice';
import { USE_MOCK } from '../config/apiConfig';
import type { AuthUser } from '../store/slices/authSlice';
import type { ICarrinho } from '../interfaces/carrinho';
import type { IVendaInput } from '../services/contracts/checkoutService';
import type { IFreteOpcao } from '../interfaces/entrega';

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
  freteOpcaoSelecionada?: IFreteOpcao | null,
): IVendaInput {
  return {
    usuarioUuid: usuario.uuid,
    itens: carrinho.itens.map((it) => ({
      livroUuid: it.uuid,
      quantidade: it.quantidade,
    })),
    valorFrete: frete,
    ...(freteOpcaoSelecionada?.cotacaoUuid ?? freteOpcaoSelecionada?.uuid
      ? {
          cotacaoUuid:
            freteOpcaoSelecionada.cotacaoUuid ?? freteOpcaoSelecionada.uuid,
        }
      : {}),
  };
}
