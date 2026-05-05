import type { ICartaoSalvo } from '../interfaces/checkout';
import type { ICupomAplicado } from '../interfaces/pagamento';
import type { IPagamentoService } from '../services/contracts/pagamentoService';
import type { OpcoesFinalizarCheckout } from '../types/checkout';
import type { IPagamentoParcial } from '../interfaces/pagamento';
import {
  isLinhaPix,
} from './finalizarCompraLinhasPagamento';
import { valorTotalPedidoSemCupons, validarSomaPagamentosVsPedido } from './cupomUtils';
import { resolverCartaoParaSelecionar } from './cartaoUtils';
import { montarPixPendente, type PixPendenteInfo } from './pixUtils';

/**
 * Registra cupons, processa cartões (síncrono) e cria cobranças PIX (assíncrono — sem POST .../processar).
 * Cartões são processados antes das linhas PIX para manter o status da venda coerente.
 */
export type ResultadoLiquidacaoPagamentos = {
  pixPendente: boolean;
  pixPendentes: PixPendenteInfo[];
};

export async function executarPagamentosAposCriarVenda(params: {
  pagamentoService: IPagamentoService;
  vendaUuid: string;
  subtotal: number;
  frete: number;
  cuponsAplicados: ICupomAplicado[];
  pagamentosEfetivos: IPagamentoParcial[];
  opcoesOpcional?: OpcoesFinalizarCheckout;
  cartoesSalvos: ICartaoSalvo[];
}): Promise<ResultadoLiquidacaoPagamentos> {
  const {
    pagamentoService,
    vendaUuid,
    subtotal,
    cuponsAplicados,
    pagamentosEfetivos,
    opcoesOpcional,
    cartoesSalvos,
  } = params;

  const totalPedido = valorTotalPedidoSemCupons(subtotal, params.frete);

  for (const cupom of cuponsAplicados) {
    if (cupom.tipo === 'promocional') {
      const valor = Math.round(((subtotal * cupom.valor) / 100) * 100) / 100;
      await pagamentoService.selecionarPagamentoLiquida({
        vendaUuid,
        valor,
        tipoPagamento: 'cupom_promocional',
        detalhesCupom: cupom.codigo,
      });
      continue;
    }
    const valor = Math.min(cupom.valor, 50);
    await pagamentoService.selecionarPagamentoLiquida({
      vendaUuid,
      valor,
      tipoPagamento: 'cupom_troca',
      detalhesCupom: cupom.codigo,
    });
  }

  const somaCartoes = pagamentosEfetivos.reduce((s, p) => s + p.valor, 0);
  validarSomaPagamentosVsPedido(totalPedido, cuponsAplicados, subtotal, somaCartoes);

  const linhasCartao = pagamentosEfetivos.filter((l) => !isLinhaPix(l.referenciaMeioPagamento));
  const linhasPix = pagamentosEfetivos.filter((l) => isLinhaPix(l.referenciaMeioPagamento));
  const pixPendentes: PixPendenteInfo[] = [];

  for (const linha of linhasCartao) {
    const cartao = resolverCartaoParaSelecionar(linha, opcoesOpcional, cartoesSalvos);
    const resposta = await pagamentoService.selecionarPagamentoLiquida({
      vendaUuid,
      valor: linha.valor,
      tipoPagamento: 'cartao_credito',
      parcelasCartao: linha.parcelasCartao ?? 1,
      cartao,
    });
    const autorizacao = await pagamentoService.solicitarAutorizacaoFinanceira(resposta.id);
    if (autorizacao.status === 'recusado') {
      throw new Error('Pagamento recusado pelo emissor do cartão.');
    }
  }

  for (const linha of linhasPix) {
    const resposta = await pagamentoService.selecionarPagamentoLiquida({
      vendaUuid,
      valor: linha.valor,
      tipoPagamento: 'pix',
    });
    const pix = resposta.pixCobranca;
    if (!pix) {
      throw new Error('Resposta PIX sem dados de cobrança (copia-e-cola).');
    }
    pixPendentes.push(montarPixPendente(resposta.id, linha.valor, pix));
  }


  return {
    pixPendente: pixPendentes.length > 0,
    pixPendentes,
  };
}
