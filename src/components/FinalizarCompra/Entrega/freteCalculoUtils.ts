export function formatarValorFrete(valor: number): string {
  if (valor === 0) {
    return 'Grátis';
  }
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
