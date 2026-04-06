import type { NavigateFunction } from 'react-router-dom';
import type { AppDispatch } from '@/store';
import type { AuthUser } from '@/store/slices/authSlice';
import type { ICarrinho } from '@/interfaces/carrinho';
import type { ICupomAplicado } from '@/interfaces/pagamento';
import type { ICheckoutInfo } from '@/interfaces/checkout';
import type { IEnderecoEntregaInput, IEntregaInputDto } from '@/interfaces/entrega';
import { CheckoutService } from '@/services/checkoutService';
import { limparCarrinhoAposPedido, montarPayloadVenda } from '@/utils/checkoutFinalizarPedido';
import { totaisCheckoutComFrete, montarPagamentosEfetivosCheckout } from '@/utils/checkoutFinalizeHelpers';
import { executarPagamentosAposCriarVenda, valorTotalPedidoSemCupons } from '@/utils/checkoutLiquidacaoPagamentos';
import type { OpcoesFinalizarCheckout } from '@/types/checkout';
import type { IPagamentoService } from '@/services/contracts/pagamentoService';
import { USE_MOCK } from '@/config/apiConfig';
import type { IFreteOpcao } from '@/interfaces/entrega';
import { salvarCartaoPerfilSeSolicitado } from '@/utils/checkoutSalvarCartaoPerfil';

type FreteSelecionado = IFreteOpcao | null | undefined;

function validarFormaPagamentoETotais(
  total: number,
  pagamentosEfetivos: { cartaoUuid: string; valor: number }[],
): void {
  if (total > 0 && pagamentosEfetivos.length === 0) {
    throw new Error('Selecione uma forma de pagamento');
  }
}

function validarFreteEEnderecoApiReal(
  freteSelecionado: FreteSelecionado,
  enderecoEntrega: IEnderecoEntregaInput | undefined | null,
): void {
  if (!freteSelecionado) {
    throw new Error('Selecione uma opção de frete.');
  }
  if (!enderecoEntrega) {
    throw new Error('Selecione o endereço de entrega.');
  }
}

async function liquidarPagamentosEEntregaNaApi(params: {
  pagamentoService: IPagamentoService;
  vendaUuid: string;
  subtotal: number;
  frete: number;
  cuponsAplicados: ICupomAplicado[];
  pagamentosEfetivos: { cartaoUuid: string; valor: number }[];
  opcoes: OpcoesFinalizarCheckout | undefined;
  checkoutData: ICheckoutInfo | null;
  enderecoEntrega: IEnderecoEntregaInput;
  cadastrarEntrega: (
    vendaUuid: string,
    endereco: IEntregaInputDto['endereco'],
  ) => Promise<unknown>;
}): Promise<void> {
  const {
    pagamentoService,
    vendaUuid,
    subtotal,
    frete,
    cuponsAplicados,
    pagamentosEfetivos,
    opcoes,
    checkoutData,
    enderecoEntrega,
    cadastrarEntrega,
  } = params;

  await executarPagamentosAposCriarVenda({
    pagamentoService,
    vendaUuid,
    subtotal,
    frete,
    cuponsAplicados,
    pagamentosEfetivos,
    opcoesOpcional: opcoes,
    cartoesSalvos: checkoutData?.cartoesSalvos ?? [],
  });

  const entregaResult = await cadastrarEntrega(vendaUuid, enderecoEntrega);
  if (!entregaResult) {
    throw new Error('Não foi possível registrar a entrega.');
  }
}

/** Orquestra validação, criação de venda, liquidação e navegação; lógica auxiliar em helpers no mesmo arquivo. */
// eslint-disable-next-line complexity -- fluxo de checkout integrado em um único ponto de entrada
export async function executarFinalizarCheckout(params: {
  carrinho: ICarrinho;
  usuario: AuthUser;
  cuponsAplicados: ICupomAplicado[];
  pagamentosParciais: { cartaoUuid: string; valor: number }[];
  freteSelecionado: FreteSelecionado;
  opcoes?: OpcoesFinalizarCheckout;
  dispatch: AppDispatch;
  navigate: NavigateFunction;
  pagamentoService: IPagamentoService;
  checkoutData: ICheckoutInfo | null;
  cadastrarEntrega: (
    vendaUuid: string,
    endereco: IEntregaInputDto['endereco'],
  ) => Promise<unknown>;
  /** Pedido já concluído; só avisa que o cartão não foi gravado no perfil (fluxo não bloqueante). */
  onSalvarCartaoCheckoutFalhou?: (erro: Error) => void;
}): Promise<void> {
  const {
    carrinho,
    usuario,
    cuponsAplicados,
    pagamentosParciais,
    freteSelecionado,
    opcoes,
    dispatch,
    navigate,
    pagamentoService,
    checkoutData,
    cadastrarEntrega,
    onSalvarCartaoCheckoutFalhou,
  } = params;

  const frete = freteSelecionado?.valor ?? carrinho.resumo.frete;
  const { subtotal, total } = totaisCheckoutComFrete(carrinho, frete, cuponsAplicados);
  const pagamentosEfetivos = montarPagamentosEfetivosCheckout(opcoes, total, pagamentosParciais);

  validarFormaPagamentoETotais(total, pagamentosEfetivos);

  const enderecoEntrega = opcoes?.enderecoEntrega;

  if (!USE_MOCK) {
    validarFreteEEnderecoApiReal(freteSelecionado, enderecoEntrega);
  }

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

  if (!USE_MOCK) {
    await liquidarPagamentosEEntregaNaApi({
      pagamentoService,
      vendaUuid,
      subtotal,
      frete,
      cuponsAplicados,
      pagamentosEfetivos,
      opcoes,
      checkoutData,
      enderecoEntrega: enderecoEntrega as IEnderecoEntregaInput,
      cadastrarEntrega,
    });
  }

  try {
    await salvarCartaoPerfilSeSolicitado(opcoes?.novoCartao, usuario.uuid);
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    if (onSalvarCartaoCheckoutFalhou) {
      onSalvarCartaoCheckoutFalhou(err);
    } else {
      console.warn('[Checkout] Não foi possível salvar o cartão no perfil:', err);
    }
  }

  await limparCarrinhoAposPedido(dispatch);
  navigate(`/pedido-confirmado?pedido=${vendaUuid}`);
}

export function tratarErroFinalizarCheckout(err: unknown, setError: (e: Error) => void): void {
  const mensagem = err instanceof Error ? err.message : 'Erro desconhecido ao finalizar compra';
  setError(new Error(mensagem));
  alert('Erro ao finalizar compra: ' + mensagem);
}
