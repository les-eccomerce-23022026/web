import type { NavigateFunction } from 'react-router-dom';
import type { AppDispatch } from '@/store';
import type { AuthUser } from '@/store/slices/authSlice';
import type { ICarrinho } from '@/interfaces/carrinho';
import type { ICupomAplicado, IPagamentoParcial, IProcessarPagamentoResultado } from '@/interfaces/pagamento';
import type { ICheckoutInfo } from '@/interfaces/checkout';
import type { IEnderecoEntregaInput, IEntregaInputDto } from '@/interfaces/entrega';
import { CheckoutService } from '@/services/checkoutService';
import { limparCarrinhoAposPedido, montarPayloadVenda } from '@/utils/finalizarCompraPedido';
import {
  montarLiquidaçõesEfetivasFinalizarCompra,
  totaisFinalizarCompraComFrete,
} from '@/utils/finalizarCompraTotais';
import {
  valorTotalPedidoSemCupons,
} from '@/utils/finalizarCompraLiquidacaoPagamentos';
import type { OpcoesFinalizarCheckout } from '@/types/checkout';
import type { IPagamentoService } from '@/services/contracts/pagamentoService';
import { USE_MOCK } from '@/config/apiConfig';
import type { IFreteOpcao } from '@/interfaces/entrega';
import { salvarCartoesPerfilSeSolicitado } from '@/utils/finalizarCompraSalvarCartaoPerfil';

type FreteSelecionado = IFreteOpcao | null | undefined;

function validarFormaPagamentoETotais(
  total: number,
  pagamentosEfetivos: IPagamentoParcial[],
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
  navigate: NavigateFunction;
  pagamentoService: IPagamentoService;
  solicitarAutorizacaoFinanceiraCheckout: (
    vendaUuid: string,
    valorTotal: number,
    pagamentosOverride?: IPagamentoParcial[],
  ) => Promise<IProcessarPagamentoResultado | null>;
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
    parcelasLiquidacao,
    freteSelecionado,
    opcoes,
    dispatch,
    navigate,
    solicitarAutorizacaoFinanceiraCheckout,
    cadastrarEntrega,
    onSalvarCartaoCheckoutFalhou,
  } = params;

  const frete = freteSelecionado?.valor ?? carrinho.resumo.frete;
  const { subtotal, total } = totaisFinalizarCompraComFrete(carrinho, frete, cuponsAplicados);
  const pagamentosEfetivos = montarLiquidaçõesEfetivasFinalizarCompra(opcoes, total, parcelasLiquidacao);

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
    // Para API real, usamos o endpoint bulk que garante atomicidade multi-cartão (Sprint 1)
    const resPag = await solicitarAutorizacaoFinanceiraCheckout(vendaUuid, total, pagamentosEfetivos);
    if (!resPag || !resPag.sucesso) {
      throw new Error('Pagamento não autorizado. Verifique os dados dos cartões e cupons.');
    }

    // Registrar a entrega
    const entregaResult = await cadastrarEntrega(vendaUuid, enderecoEntrega as IEnderecoEntregaInput);
    if (!entregaResult) {
      throw new Error('Não foi possível registrar a entrega.');
    }
  }

  try {
    await salvarCartoesPerfilSeSolicitado(opcoes?.novosCartoesPorLinha, opcoes?.novoCartao, usuario.uuid);
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    if (onSalvarCartaoCheckoutFalhou) {
      onSalvarCartaoCheckoutFalhou(err);
      return;
    }
    console.warn('[Checkout] Não foi possível salvar o cartão no perfil:', err);
  }

  await limparCarrinhoAposPedido(dispatch);

  navigate(`/pedido-confirmado?pedido=${vendaUuid}`);
}

export function tratarErroFinalizarCheckout(err: unknown, setError: (e: Error) => void): void {
  const mensagem = err instanceof Error ? err.message : 'Erro desconhecido ao finalizar compra';
  setError(new Error(mensagem));
  alert('Erro ao finalizar compra: ' + mensagem);
}
