import type { ICartaoCreditoInput, IPagamentoParcial } from '@/interfaces/pagamento';
import type { LinhaPagamentoCheckout } from '@/types/checkout';

export const PREFIXO_LINHA_NOVO = 'novo:';
export const PREFIXO_LINHA_PIX = 'pix:';

export function referenciaMeioPagamentoParaLinha(tipo: LinhaPagamentoCheckout['tipo'], id: string): string {
  if (tipo === 'pix') return `${PREFIXO_LINHA_PIX}${id}`;
  if (tipo === 'cartao_novo') return `${PREFIXO_LINHA_NOVO}${id}`;
  throw new Error('Use o UUID do cartão salvo diretamente');
}

/** @deprecated Use referenciaMeioPagamentoParaLinha */
export const cartaoUuidParaLinha = referenciaMeioPagamentoParaLinha;

export function montarParcelasLiquidadasDasLinhasCheckout(
  linhas: LinhaPagamentoCheckout[],
): IPagamentoParcial[] {
  return linhas.map((l) => {
    const parcelasCartao = l.tipo === 'pix' ? undefined : (l.parcelasCartao ?? 1);
    if (l.tipo === 'pix') {
      return { referenciaMeioPagamento: `${PREFIXO_LINHA_PIX}${l.id}`, valor: l.valor };
    }
    if (l.tipo === 'cartao_novo') {
      return {
        referenciaMeioPagamento: `${PREFIXO_LINHA_NOVO}${l.id}`,
        valor: l.valor,
        parcelasCartao,
      };
    }
    if (!l.cartaoSalvoUuid) {
      throw new Error('Linha de cartão salvo sem UUID');
    }
    return {
      referenciaMeioPagamento: l.cartaoSalvoUuid,
      valor: l.valor,
      parcelasCartao,
    };
  });
}

/** @deprecated Use montarParcelasLiquidadasDasLinhasCheckout */
export const linhasCheckoutParaParciais = montarParcelasLiquidadasDasLinhasCheckout;

export function isLinhaPix(referenciaMeioPagamento: string): boolean {
  return referenciaMeioPagamento.startsWith(PREFIXO_LINHA_PIX);
}

export function isLinhaNovoCartao(referenciaMeioPagamento: string): boolean {
  return referenciaMeioPagamento.startsWith(PREFIXO_LINHA_NOVO);
}

export function idDePrefixoNovo(referenciaMeioPagamento: string): string {
  return referenciaMeioPagamento.slice(PREFIXO_LINHA_NOVO.length);
}

export function idDePrefixoPix(referenciaMeioPagamento: string): string {
  return referenciaMeioPagamento.slice(PREFIXO_LINHA_PIX.length);
}

/** Linha de liquidação parcial pronta para envio (cartão preenchido ou PIX). */
export function linhaPagamentoProntaParaLiquidacao(
  p: IPagamentoParcial,
  novosCartoesPorLinha: Record<string, ICartaoCreditoInput>,
): boolean {
  const ref = p.referenciaMeioPagamento;
  if (isLinhaPix(ref)) return p.valor > 0;
  if (isLinhaNovoCartao(ref)) {
    const id = idDePrefixoNovo(ref);
    return Boolean(novosCartoesPorLinha[id]);
  }
  return ref.length > 0;
}

const EPS = 0.02;

/**
 * Regra de valor mínimo por meio na divisão do pagamento (alinhado a RN0034/RN0035 na documentação).
 * Com dois ou mais meios, cada linha com valor deve ser ≥ R$ 10,00.
 * Com um único meio cobrindo o saldo após cupons, o valor pode ser menor.
 */
export function validarValorMinimoPorMeioNaDivisaoPagamento(
  linhas: LinhaPagamentoCheckout[],
  totalAposCupons: number,
): { ok: boolean; mensagem?: string } {
  if (totalAposCupons <= EPS) return { ok: true };
  const comValor = linhas.filter((l) => l.valor > EPS);
  if (comValor.length === 0) {
    return { ok: false, mensagem: 'Informe valores para cobrir o total.' };
  }
  if (comValor.length === 1) return { ok: true };
  const abaixo = comValor.find((l) => l.valor < 10 - EPS);
  if (abaixo) {
    return {
      ok: false,
      mensagem:
        'No pagamento dividido, cada cartão ou PIX deve ter no mínimo R$ 10,00 (exceto quando um único meio cobre todo o saldo após cupons).',
    };
  }
  return { ok: true };
}

/** Estado visual “validado” por linha (cartão informado / PIX com valor / cartão salvo selecionado). */
export function linhaCheckoutVisualValidada(
  linha: LinhaPagamentoCheckout,
  novosCartoesPorLinha: Record<string, ICartaoCreditoInput>,
): boolean {
  if (linha.tipo === 'pix') return linha.valor > EPS;
  if (linha.tipo === 'cartao_novo') return Boolean(novosCartoesPorLinha[linha.id]);
  return Boolean(linha.cartaoSalvoUuid?.trim());
}

/** Linha com valor > 0 abaixo de R$ 10 quando a regra de divisão exige mínimo por meio. */
export function linhaAbaixoMinimoDivisaoPagamento(
  linha: LinhaPagamentoCheckout,
  linhas: LinhaPagamentoCheckout[],
  totalAposCupons: number,
): boolean {
  if (totalAposCupons <= EPS) return false;
  const comValor = linhas.filter((l) => l.valor > EPS);
  if (comValor.length <= 1) return false;
  if (linha.valor <= EPS) return false;
  return linha.valor < 10 - EPS;
}
