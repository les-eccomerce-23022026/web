import type { ICupomAplicado, IPagamentoParcial } from '../interfaces/pagamento';
import type { ICheckoutInfo } from '../interfaces/checkout';
import type { IEnderecoEntregaInput, IEntregaInputDto } from '../interfaces/entrega';
import type { IPagamentoService } from '../services/contracts/pagamentoService';
import type { OpcoesFinalizarCheckout } from '../types/checkout';
import {
  executarPagamentosAposCriarVenda,
  type ResultadoLiquidacaoPagamentos,
} from './finalizarCompraLiquidacaoPagamentos';

async function liquidarPagamentosEEntregaNaApi(params: {
  pagamentoService: IPagamentoService;
  vendaUuid: string;
  subtotal: number;
  frete: number;
  /** Mesmo valor persistido em `vendas.ven_frete` (backend pode recalcular via cotação). Obrigatório para POST /entregas. */
  custoFreteRegistradoNaVenda: number;
  cuponsAplicados: ICupomAplicado[];
  pagamentosEfetivos: IPagamentoParcial[];
  opcoes: OpcoesFinalizarCheckout | undefined;
  checkoutData: ICheckoutInfo | null;
  enderecoEntrega: IEnderecoEntregaInput;
  cadastrarEntrega: (
    vendaUuid: string,
    endereco: IEntregaInputDto['endereco'],
    custoFrete: number,
  ) => Promise<unknown>;
}): Promise<ResultadoLiquidacaoPagamentos> {
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
    custoFreteRegistradoNaVenda,
  } = params;

  const liquidacao = await executarPagamentosAposCriarVenda({
    pagamentoService,
    vendaUuid,
    subtotal,
    frete,
    cuponsAplicados,
    pagamentosEfetivos,
    opcoesOpcional: opcoes,
    cartoesSalvos: checkoutData?.cartoesSalvos ?? [],
  });

  if (liquidacao.pixPendente) {
    return liquidacao;
  }

  const entregaResult = await cadastrarEntrega(
    vendaUuid,
    enderecoEntrega,
    custoFreteRegistradoNaVenda,
  );
  if (!entregaResult) {
    throw new Error('Não foi possível registrar a entrega.');
  }
  return liquidacao;
}

export { liquidarPagamentosEEntregaNaApi };
