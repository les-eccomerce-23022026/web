import type { ICupomAplicado } from '../interfaces/pagamento';
import { calcularDescontoCupons } from './finalizarCompraCupomTotais';

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
