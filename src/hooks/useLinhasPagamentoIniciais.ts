import { useMemo } from 'react';
import { calcularResumoPedidoFinalizarCompra } from '../pages/Vendas/FinalizarCompra/finalizarCompraCalculos';
import { generateSafeId } from '@/utils/generateId';
import type { ICheckoutInfo } from '@/interfaces/checkout';
import type { ICarrinho } from '@/interfaces/carrinho'; 
import type { LinhaPagamentoCheckout } from '@/types/checkout';
import type { ICupomAplicado } from '@/interfaces/pagamento';

export const useLinhasPagamentoIniciais = (data: ICheckoutInfo, carrinho: ICarrinho | null | undefined, freteSelecionado: any, cuponsAplicados: ICupomAplicado[]) => {
  return useMemo(() => {
    if (!data || !carrinho?.itens?.length) return [];
    const r = calcularResumoPedidoFinalizarCompra(carrinho, data, freteSelecionado, cuponsAplicados, []);
    const total = Math.round(r.total * 100) / 100;
    const id = generateSafeId();

    if (data.cartoesSalvos.length > 0) {
      return [
        {
          id,
          tipo: 'cartao_salvo' as const,
          cartaoSalvoUuid: data.cartoesSalvos[0].uuid,
          valor: total,
          parcelasCartao: 1,
        },
      ] as LinhaPagamentoCheckout[];
    }
    return [{ id, tipo: 'cartao_novo' as const, valor: total, parcelasCartao: 1 }] as LinhaPagamentoCheckout[];
  }, [data, carrinho, freteSelecionado, cuponsAplicados]);
}
