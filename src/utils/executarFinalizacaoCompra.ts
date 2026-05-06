import type { AppDispatch } from '../store/index';
import type { AuthUser } from '../store/slices/authSlice';
import type { ICarrinho } from '../interfaces/carrinho';
import type { ICupomAplicado, IPagamentoParcial } from '../interfaces/pagamento';
import type { ICheckoutInfo } from '../interfaces/checkout';
import type { IEnderecoEntregaInput, IEntregaInputDto } from '../interfaces/entrega';
import { limparCarrinhoAposPedido } from './finalizarCompraPedido';
import type { ResultadoLiquidacaoPagamentos } from './finalizarCompraLiquidacaoPagamentos';
import type { OpcoesFinalizarCheckout } from '../types/checkout';
import type { IPagamentoService } from '../services/contracts/pagamentoService';
import { USE_MOCK } from '../config/apiConfig';
import type { IFreteOpcao } from '../interfaces/entrega';
import { salvarCartoesPerfilSeSolicitado } from './finalizarCompraSalvarCartaoPerfil';
import { mapearErroUsuario } from './mapearErro';
import { validarFormaPagamentoETotais, validarFreteEEnderecoApiReal } from './checkoutValidations';
import { liquidarPagamentosEEntregaNaApi } from './checkoutLiquidacao';
import { criarVendaCheckout } from './checkoutVenda';
import { navegarAposCheckout } from './checkoutNavegacao';

type NextRouter = {
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
};

type FreteSelecionado = IFreteOpcao | null | undefined;

/** Orquestra validação, criação de venda, liquidação e navegação. */
// eslint-disable-next-line complexity -- fluxo de checkout integrado em um único ponto de entrada
export async function executarFinalizarCheckout(params: {
  carrinho: ICarrinho;
  usuario: AuthUser;
  cuponsAplicados: ICupomAplicado[];
  parcelasLiquidacao: IPagamentoParcial[];
  freteSelecionado: FreteSelecionado;
  opcoes?: OpcoesFinalizarCheckout;
  dispatch: AppDispatch;
  navigate: NextRouter;
  pagamentoService: IPagamentoService;
  checkoutData: ICheckoutInfo | null;
  cadastrarEntrega: (
    vendaUuid: string,
    endereco: IEntregaInputDto['endereco'],
    custoFrete: number,
  ) => Promise<unknown>;
  /** Pedido já concluído; só avisa que o cartão não foi gravado no perfil (fluxo não bloqueante). */
  onSalvarCartaoCheckoutFalhou?: (erro: Error) => void;
  /** Função para mostrar notificação de erro */
}): Promise<void> {
  const {
    carrinho,
    usuario,
    cuponsAplicados,
    parcelasLiquidacao,
    freteSelecionado,
    opcoes,
    dispatch,
    navigate,
    pagamentoService,
    checkoutData,
    cadastrarEntrega,
    onSalvarCartaoCheckoutFalhou,
  } = params;

  const enderecoEntrega = opcoes?.enderecoEntrega;

  if (!USE_MOCK) {
    validarFreteEEnderecoApiReal(freteSelecionado, enderecoEntrega);
  }

  const { vendaUuid, custoFreteNaVenda, subtotal, frete, pagamentosEfetivos } = await criarVendaCheckout({
    carrinho,
    usuario,
    cuponsAplicados,
    parcelasLiquidacao,
    freteSelecionado,
    opcoes,
  });

  validarFormaPagamentoETotais(
    pagamentosEfetivos.reduce((s, p) => s + p.valor, 0),
    pagamentosEfetivos,
  );

  let liquidacaoPix: ResultadoLiquidacaoPagamentos | null = null;
  if (!USE_MOCK) {
    liquidacaoPix = await liquidarPagamentosEEntregaNaApi({
      pagamentoService,
      vendaUuid,
      subtotal,
      frete,
      custoFreteRegistradoNaVenda: custoFreteNaVenda,
      cuponsAplicados,
      pagamentosEfetivos,
      opcoes,
      checkoutData,
      enderecoEntrega: enderecoEntrega as IEnderecoEntregaInput,
      cadastrarEntrega,
    });
  }

  try {
    await salvarCartoesPerfilSeSolicitado(opcoes?.novosCartoesPorLinha, opcoes?.novoCartao, usuario.uuid);
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    if (!onSalvarCartaoCheckoutFalhou) {
      console.warn('[Checkout] Não foi possível salvar o cartão no perfil:', err);
      return;
    }
    onSalvarCartaoCheckoutFalhou(err);
  }

  await limparCarrinhoAposPedido(dispatch);

  navegarAposCheckout({
    liquidacaoPix,
    vendaUuid,
    freteSelecionado,
    enderecoEntrega: enderecoEntrega ?? undefined,
    navigate,
    useMock: USE_MOCK,
  });
}

export function tratarErroFinalizarCheckout(
  err: unknown,
  setError: (e: Error) => void,
  showError: (message: string) => void
): void {
  const mensagemSegura = mapearErroUsuario(err);
  setError(new Error(mensagemSegura));
  showError(mensagemSegura);
}
