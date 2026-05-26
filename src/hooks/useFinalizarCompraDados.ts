import { useCallback, useEffect, useState } from 'react';
import { PagamentoService } from '../services/pagamentoService';
import type { ICarrinho } from '../interfaces/carrinho';
import type { ICheckoutInfo } from '../interfaces/checkout';
import { buildCheckoutInfoFromPagamento } from '../utils/finalizarCompraFromPagamentoInfo';

interface UseFinalizarCompraDadosParams {
  carrinho: ICarrinho | null;
  carrinhoStatus: string;
}

export function useFinalizarCompraDados({ carrinho, carrinhoStatus }: UseFinalizarCompraDadosParams) {
  const [data, setData] = useState<ICheckoutInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const carregarInformacoesFinalizarCompra = useCallback(async () => {
    if (carrinhoStatus !== 'succeeded') return;
    if (!carrinho?.itens?.length) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const infoPagamento = await PagamentoService.obterPagamentoInfo();
      setData(buildCheckoutInfoFromPagamento(infoPagamento, carrinho));
    } catch (erro) {
      const erroNormalizado =
        erro instanceof Error ? erro : new Error('Erro ao carregar informações de checkout');
      setError(erroNormalizado);
    } finally {
      setLoading(false);
    }
  }, [carrinho, carrinhoStatus]);

  // Sincronização de loading com estado do carrinho e dados
  useEffect(() => {
    if (carrinhoStatus === 'succeeded') {
      if (!carrinho?.itens?.length) {
        // Usar setTimeout para evitar setState síncrono no effect
        setTimeout(() => {
          setLoading(false);
        }, 0);
        return;
      }
      if (!data || data.resumoPedido.subtotal !== carrinho.resumo.subtotal) {
        // Usar setTimeout para evitar setState síncrono no effect
        setTimeout(() => {
          void carregarInformacoesFinalizarCompra();
        }, 0);
      }
    } else {
      // Usar setTimeout para evitar setState síncrono no effect
      setTimeout(() => {
        setLoading(true);
      }, 0);
    }
  }, [carregarInformacoesFinalizarCompra, data, carrinho, carrinhoStatus]);

  return {
    data,
    loading,
    error,
    definirErroCheckout: setError,
    carregarInformacoesFinalizarCompra,
  };
}
