import type { ICupomAplicado } from '@/interfaces/IPagamento';

export function calcularDescontoCupons(subtotal: number, cupons: ICupomAplicado[]): number {
  return cupons.reduce((acc, cupom) => {
    if (cupom.tipo === 'promocional') {
      return acc + (subtotal * cupom.valor) / 100;
    }
    return acc + cupom.valor;
  }, 0);
}
