import type { ICartaoSalvo } from '@/interfaces/checkout';
import type { ICupomAplicado } from '@/interfaces/pagamento';
import type { IPagamentoService } from '@/services/contracts/pagamentoService';
import type { OpcoesFinalizarCheckout } from '@/types/checkout';
import { calcularDescontoCupons } from '@/utils/checkoutCupomTotais';

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
  linha: { cartaoUuid: string; valor: number },
  opcoes: OpcoesFinalizarCheckout | undefined,
  cartoesSalvos: ICartaoSalvo[],
): { numero: string; nomeTitular: string; validade: string; bandeira: string } {
  if (linha.cartaoUuid === 'novo' && opcoes?.novoCartao) {
    const c = opcoes.novoCartao;
    return {
      numero: c.numero.replace(/\s/g, ''),
      nomeTitular: c.nomeTitular,
      validade: c.validade,
      bandeira: normalizarBandeiraCartao(c.bandeira),
    };
  }
  const salvo = cartoesSalvos.find((c) => c.uuid === linha.cartaoUuid);
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

export async function executarPagamentosAposCriarVenda(params: {
  pagamentoService: IPagamentoService;
  vendaUuid: string;
  subtotal: number;
  frete: number;
  cuponsAplicados: ICupomAplicado[];
  pagamentosEfetivos: { cartaoUuid: string; valor: number }[];
  opcoesOpcional?: OpcoesFinalizarCheckout;
  cartoesSalvos: ICartaoSalvo[];
}): Promise<void> {
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
    } else {
      const valor = Math.min(cupom.valor, 50);
      await pagamentoService.selecionarPagamentoLiquida({
        vendaUuid,
        valor,
        tipoPagamento: 'cupom_troca',
        detalhesCupom: cupom.codigo,
      });
    }
  }

  const somaCartoes = pagamentosEfetivos.reduce((s, p) => s + p.valor, 0);
  validarSomaPagamentosVsPedido(totalPedido, cuponsAplicados, subtotal, somaCartoes);

  for (const linha of pagamentosEfetivos) {
    const cartao = resolverCartaoParaSelecionar(linha, opcoesOpcional, cartoesSalvos);
    const resposta = await pagamentoService.selecionarPagamentoLiquida({
      vendaUuid,
      valor: linha.valor,
      tipoPagamento: 'cartao_credito',
      cartao,
    });
    await pagamentoService.solicitarAutorizacaoFinanceira(resposta.id);
  }
}
