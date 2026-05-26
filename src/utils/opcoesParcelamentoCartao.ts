import {
  PARCELAS_CARTAO_MAX,
  VALOR_MINIMO_PARCELAMENTO,
  type IPoliticaParcelamentoCartao,
} from '../interfaces/pagamento';

/** Uma opção de parcelamento para exibir no select do checkout (valor da linha de cartão). */
export type OpcaoParcelamentoCartao = {
  quantidadeParcelas: number;
  rotuloSelect: string;
  comJuros: boolean;
  valorParcela: number;
};

function formatarBrlDuasCasas(n: number): string {
  return n.toFixed(2).replace('.', ',');
}

/**
 * Lista opções de parcelamento com rótulo (valor por parcela e com/sem juros)
 * conforme política do backend e o valor líquido da linha no split.
 * 
 * RN0069: Compras abaixo de R$ 80,00 não são elegíveis para parcelamento.
 * Retorna apenas opção à vista quando valor < R$ 80,00.
 */
export function opcoesParcelamentoCartaoParaValor(
  valorLinha: number,
  politica: IPoliticaParcelamentoCartao,
): OpcaoParcelamentoCartao[] {
  const maxParcelas = Math.min(
    Math.max(1, Math.floor(politica.parcelasMaximas)),
    PARCELAS_CARTAO_MAX,
  );
  const limiteSemJuros = Math.min(
    Math.max(0, Math.floor(politica.parcelasSemJuros)),
    maxParcelas,
  );

  const valor = Number.isFinite(valorLinha) && valorLinha > 0 ? valorLinha : 0;
  
  // RN0069: Valores abaixo de R$ 80,00 não são elegíveis para parcelamento
  const elegivelParcelamento = valor >= VALOR_MINIMO_PARCELAMENTO;
  const parcelasMaximas = elegivelParcelamento ? maxParcelas : 1;
  
  const opcoes: OpcaoParcelamentoCartao[] = [];

  for (let n = 1; n <= parcelasMaximas; n += 1) {
    const valorParcela = Math.round((valor / n) * 100) / 100;
    const comJuros = n > limiteSemJuros;
    const rotuloSelect =
      n === 1
        ? `1x de R$ ${formatarBrlDuasCasas(valorParcela)} (à vista) sem juros`
        : `${n}x de R$ ${formatarBrlDuasCasas(valorParcela)} ${comJuros ? 'com juros' : 'sem juros'}`;
    opcoes.push({
      quantidadeParcelas: n,
      rotuloSelect,
      comJuros,
      valorParcela,
    });
  }

  return opcoes;
}

/**
 * Verifica se um valor é elegível para parcelamento (RN0069).
 */
export function elegivelParaParcelamento(valor: number): boolean {
  return valor >= VALOR_MINIMO_PARCELAMENTO;
}
