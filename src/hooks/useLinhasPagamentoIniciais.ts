import { useMemo } from 'react';
import { calcularResumoPedidoFinalizarCompra } from '../pages-react-router/Vendas/FinalizarCompra/finalizarCompraCalculos';
import { generateSafeId } from '../utils/generateId';
import type { ICheckoutInfo } from '../interfaces/checkout';
import type { ICarrinho } from '../interfaces/carrinho';
import type { IFreteOpcao } from '../interfaces/pagamento';
import type { LinhaPagamentoCheckout } from '../types/checkout';
import type { ICupomAplicado } from '../interfaces/pagamento';

export const useLinhasPagamentoIniciais = (data: ICheckoutInfo, carrinho: ICarrinho | null | undefined, freteSelecionado: IFreteOpcao | null, cuponsAplicados: ICupomAplicado[]) => {
  return useMemo(() => {
    // Se não há carrinho ou itens, retorna array vazio
    if (!carrinho?.itens?.length) return [];
    
    // Se não há data, usa valores padrão
    const checkoutData = data || { cartoesSalvos: [] } as ICheckoutInfo;
    
    const r = calcularResumoPedidoFinalizarCompra(carrinho, checkoutData, freteSelecionado, cuponsAplicados);
    const total = Math.round(r.total * 100) / 100;
    const id = generateSafeId();

    if (checkoutData.cartoesSalvos.length > 0) {
      return [
        {
          id,
          tipo: 'cartao_salvo' as const,
          cartaoSalvoUuid: checkoutData.cartoesSalvos[0].uuid,
          valor: total,
          parcelasCartao: 1,
        },
      ] as LinhaPagamentoCheckout[];
    }
    return [{ id, tipo: 'cartao_novo' as const, valor: total, parcelasCartao: 1 }] as LinhaPagamentoCheckout[];
  }, [data, carrinho, freteSelecionado, cuponsAplicados]);
}
