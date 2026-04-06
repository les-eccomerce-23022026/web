import {
  PARCELAS_CARTAO_MAX,
  type IPoliticaParcelamentoCartao,
} from '@/interfaces/pagamento';

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
  const opcoes: OpcaoParcelamentoCartao[] = [];

  for (let n = 1; n <= maxParcelas; n += 1) {
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
