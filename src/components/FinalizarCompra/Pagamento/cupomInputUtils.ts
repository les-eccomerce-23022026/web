import type { ICupomAplicado, ICupomDisponivel } from '@/interfaces/pagamento';

export function formatarValorCupom(cupom: ICupomAplicado | ICupomDisponivel): string {
  if (cupom.tipo === 'promocional') {
    return `- ${cupom.valor}%`;
  }

  return `- R$ ${cupom.valor.toFixed(2).replace('.', ',')}`;
}

export function formatarValorSugestaoCupom(cupom: ICupomDisponivel): string {
  if (cupom.tipo === 'promocional') {
    return `${cupom.valor}% de desconto`;
  }

  return `R$ ${cupom.valor.toFixed(2).replace('.', ',')} de troca`;
}

export function filtrarCuponsNaoAplicados(
  cuponsDisponiveis: ICupomDisponivel[],
  cuponsAplicados: ICupomAplicado[],
): ICupomDisponivel[] {
  return cuponsDisponiveis.filter((cupom) =>
    !cuponsAplicados.some((cupomAplicado) => cupomAplicado.uuid === cupom.uuid),
  );
}

export function validarCodigoCupom({
  codigoDigitado,
  cuponsDisponiveis,
  cupomPromocionalAplicado,
  subtotalAtual,
}: {
  codigoDigitado: string;
  cuponsDisponiveis: ICupomDisponivel[];
  cupomPromocionalAplicado?: ICupomAplicado;
  subtotalAtual?: number;
}) {
  const codigoNormalizado = codigoDigitado.trim();

  if (!codigoNormalizado) {
    return { erro: 'Digite o código do cupom' };
  }

  const cupomEncontrado = cuponsDisponiveis.find(
    (cupom) => cupom.codigo.toLowerCase() === codigoNormalizado.toLowerCase(),
  );

  if (!cupomEncontrado) {
    return { erro: 'Cupom inválido ou expirado' };
  }

  if (cupomEncontrado.tipo === 'promocional' && cupomPromocionalAplicado) {
    return { erro: 'Apenas um cupom promocional é permitido por compra' };
  }

  const valorMinimo = cupomEncontrado.valorMinimo ?? 0;
  if (valorMinimo > 0 && subtotalAtual !== undefined && subtotalAtual < valorMinimo) {
    return {
      erro: `Pedido mínimo de R$ ${valorMinimo.toFixed(2).replace('.', ',')} para este cupom`,
    };
  }

  return { cupom: cupomEncontrado };
}
