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

  useEffect(() => {
    if (data && carrinho && data.resumoPedido.subtotal === carrinho.resumo.subtotal) {
      setLoading(false);
      return;
    }
    if (carrinhoStatus !== 'succeeded') {
      setLoading(true);
      return;
    }
    if (carrinho?.itens?.length) {
      void carregarInformacoesFinalizarCompra();
      return;
    }
    setLoading(false);
  }, [carregarInformacoesFinalizarCompra, data, carrinho, carrinhoStatus]);

  return {
    data,
    loading,
    error,
    definirErroCheckout: setError,
    carregarInformacoesFinalizarCompra,
  };
}
