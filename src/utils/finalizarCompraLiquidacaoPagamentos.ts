import type { ICartaoSalvo } from '@/interfaces/checkout';
import type { ICupomAplicado } from '@/interfaces/pagamento';
import type { IPagamentoService } from '@/services/contracts/pagamentoService';
import type { OpcoesFinalizarCheckout } from '@/types/checkout';
import type { IPagamentoParcial } from '@/interfaces/pagamento';
import type { IPixCobrancaSimulada } from '@/interfaces/pagamento';
import { calcularDescontoCupons } from '@/utils/finalizarCompraCupomTotais';
import {
  idDePrefixoNovo,
  isLinhaNovoCartao,
  isLinhaPix,
} from '@/utils/finalizarCompraLinhasPagamento';

/** Bandeiras aceitas pelo backend (`CartaoCredito`). */
export function normalizarBandeiraCartao(bandeira: string): string {
  const b = bandeira.trim();
  const upper = b.toUpperCase();
  const map: Record<string, string> = {
    VISA: 'Visa',
    MASTERCARD: 'Mastercard',
    ELO: 'Elo',
    AMEX: 'American Express',
    'AMERICAN EXPRESS': 'American Express',
  };
  return map[upper] ?? b;
}

/**
 * Cartões de teste Luhn-válidos por bandeira.
 *
 * **Limitação de integração:** `POST /pagamentos/selecionar` exige dados completos do cartão
 * (`numero`, `validade`, etc.). Cartões salvos no perfil expõem apenas máscara/bandeira; o backend
 * não retorna PAN/token reutilizável neste fluxo. Para integração com API real, usamos números de
 * teste válidos por bandeira apenas para satisfazer `CartaoCredito` no backend — **não** representa
 * pagamento com o cartão salvo de fato. Produção: tokenização/gateway ou endpoint que aceite UUID do cartão.
 */
export function cartaoTesteParaBandeira(bandeira: string): {
  numero: string;
  nomeTitular: string;
  validade: string;
  bandeira: string;
} {
  const b = normalizarBandeiraCartao(bandeira);
  const numero =
    b === 'Visa' ? '4111111111111111' : b === 'Mastercard' ? '5500000000000004' : '4111111111111111';
  return {
    numero,
    nomeTitular: 'Cliente Checkout',
    validade: '12/30',
    bandeira: b,
  };
}

function resolverCartaoParaSelecionar(
  linha: IPagamentoParcial,
  opcoes: OpcoesFinalizarCheckout | undefined,
  cartoesSalvos: ICartaoSalvo[],
): { numero: string; nomeTitular: string; validade: string; bandeira: string } {
  const ref = linha.referenciaMeioPagamento;
  if (isLinhaPix(ref)) {
    throw new Error('PIX não utiliza dados de cartão');
  }
  if (ref === 'novo' && opcoes?.novoCartao) {
    const c = opcoes.novoCartao;
    return {
      numero: c.numero.replace(/\s/g, ''),
      nomeTitular: c.nomeTitular,
      validade: c.validade,
      bandeira: normalizarBandeiraCartao(c.bandeira),
    };
  }
  if (isLinhaNovoCartao(ref)) {
    const id = idDePrefixoNovo(ref);
    const c = opcoes?.novosCartoesPorLinha?.[id] ?? opcoes?.novoCartao;
    if (!c) {
      throw new Error('Dados do novo cartão não encontrados para a liquidação.');
    }
    return {
      numero: c.numero.replace(/\s/g, ''),
      nomeTitular: c.nomeTitular,
      validade: c.validade,
      bandeira: normalizarBandeiraCartao(c.bandeira),
    };
  }
  const salvo = cartoesSalvos.find((c) => c.uuid === ref);
  if (!salvo) {
    throw new Error('Cartão não encontrado para a liquidação.');
  }
  return {
    ...cartaoTesteParaBandeira(salvo.bandeira),
    nomeTitular: salvo.nomeImpresso || salvo.nomeCliente,
    validade: salvo.validade.includes('/') && salvo.validade.length <= 5
      ? salvo.validade
      : '12/30',
  };
}

export function valorCupomPromocionalEmReais(subtotal: number, cupom: ICupomAplicado): number {
  return Math.round(((subtotal * cupom.valor) / 100) * 100) / 100;
}

export function valorTotalPedidoSemCupons(subtotal: number, frete: number): number {
  return Math.round((subtotal + frete) * 100) / 100;
}

/**
 * Valida se soma das liquidações (cupons + cartões) fecha com o total do pedido.
 */
export function validarSomaPagamentosVsPedido(
  totalPedidoSemCupons: number,
  cuponsAplicados: ICupomAplicado[],
  subtotal: number,
  totalPagoCartoes: number,
): void {
  const descontoCupons = calcularDescontoCupons(subtotal, cuponsAplicados);
  const totalEsperadoCartoes = totalPedidoSemCupons - descontoCupons;
  if (Math.abs(totalEsperadoCartoes - totalPagoCartoes) > 0.02) {
    throw new Error('Valores de pagamento não fecham com o total do pedido.');
  }
}

/** Linha PIX pendente de liquidação via webhook (após POST /pagamentos/selecionar). */
export type PixPendenteInfo = {
  pagamentoUuid: string;
  copiaCola: string;
  qrCodeBase64: string | null;
  expiraEm: string;
  segredoConfirmacao: string;
  valor: number;
};

export type ResultadoLiquidacaoPagamentos = {
  pixPendente: boolean;
  pixPendentes: PixPendenteInfo[];
};

function montarPixPendente(
  pagamentoUuid: string,
  valor: number,
  pix: IPixCobrancaSimulada,
): PixPendenteInfo {
  return {
    pagamentoUuid,
    copiaCola: pix.copiaCola,
    qrCodeBase64: pix.qrCodeBase64,
    expiraEm: pix.expiraEm,
    segredoConfirmacao: pix.segredoConfirmacao,
    valor,
  };
}

/**
 * Registra cupons, processa cartões (síncrono) e cria cobranças PIX (assíncrono — sem POST .../processar).
 * Cartões são processados antes das linhas PIX para manter o status da venda coerente.
 */
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
      const valor = valorCupomPromocionalEmReais(subtotal, cupom);
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
    await pagamentoService.solicitarAutorizacaoFinanceira(resposta.id);
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
