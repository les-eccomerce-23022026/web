import type { ICupomAplicado } from '@/interfaces/pagamento';

const EPS_PADRAO = 0.02;

export function formatarValorBrl(valor: number): string {
  return valor.toFixed(2).replace('.', ',');
}

export function calcularCobrancaLinhas(
  totalAposCupons: number,
  somaLinhas: number,
  eps: number = EPS_PADRAO,
) {
  const restante = totalAposCupons - somaLinhas;
  const alinhado = Math.abs(restante) < eps;

  if (totalAposCupons <= eps) {
    return {
      restante,
      alinhado,
      percentualCoberto: 100,
    };
  }

  return {
    restante,
    alinhado,
    percentualCoberto: Math.min(100, (somaLinhas / totalAposCupons) * 100),
  };
}

export function montarTextoRestanteE2e({
  cuponsAplicados,
  totalAposCupons,
  somaLinhas,
  alinhado,
  restante,
}: {
  cuponsAplicados: ICupomAplicado[];
  totalAposCupons: number;
  somaLinhas: number;
  alinhado: boolean;
  restante: number;
}): string {
  const prefixoTotal = cuponsAplicados.length > 0 ? 'Total após cupons' : 'Total';
  const textoAjuste = alinhado ? ' · OK' : ` · Ajuste de R$ ${formatarValorBrl(Math.abs(restante))}`;
  return `${prefixoTotal}: R$ ${formatarValorBrl(totalAposCupons)} · Soma das linhas: R$ ${formatarValorBrl(somaLinhas)}${textoAjuste}`;
}
