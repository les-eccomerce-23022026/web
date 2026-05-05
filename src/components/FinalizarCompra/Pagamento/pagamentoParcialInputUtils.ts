export interface ResultadoValidacao {
  valido: boolean;
  erro: string | null;
}

export function formatarValorMonetario(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function validarValorPagamentoParcial(
  valorString: string,
  valorMinimo: number,
  valorRestante: number
): ResultadoValidacao {
  const valorNumerico = parseFloat(valorString.replace(',', '.'));

  if (isNaN(valorNumerico) || valorNumerico <= 0) {
    return { valido: false, erro: 'Digite um valor válido' };
  }

  if (valorNumerico < valorMinimo) {
    return {
      valido: false,
      erro: `Valor mínimo por cartão é R$ ${formatarValorMonetario(valorMinimo)}`
    };
  }

  if (valorNumerico > valorRestante) {
    return {
      valido: false,
      erro: `Valor não pode exceder o restante de R$ ${formatarValorMonetario(valorRestante)}`
    };
  }

  return { valido: true, erro: null };
}

export function calcularValorRestante(valorTotal: number, valorJaPago: number): number {
  return valorTotal - valorJaPago;
}

export function formatarNomeCartao(nomeCartao: string | undefined, referenciaMeioPagamento: string): string {
  if (nomeCartao) {
    return nomeCartao;
  }
  return `Cartão ${referenciaMeioPagamento.slice(0, 8)}...`;
}
