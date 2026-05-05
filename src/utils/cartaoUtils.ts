import type { ICartaoSalvo } from '../interfaces/checkout';
import type { IPagamentoParcial } from '../interfaces/pagamento';
import type { OpcoesFinalizarCheckout } from '../types/checkout';
import {
  idDePrefixoNovo,
  isLinhaNovoCartao,
  isLinhaPix,
} from './finalizarCompraLinhasPagamento';

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
  let numero = '4111111111111111';
  if (b === 'Mastercard') {
    numero = '5500000000000004';
  }
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

export { resolverCartaoParaSelecionar };
