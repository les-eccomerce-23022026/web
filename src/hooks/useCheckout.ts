import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PagamentoServiceApi } from '@/services/api/PagamentoServiceApi';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import type { ICheckoutInfo } from '@/interfaces/ICheckout';
import { usePagamento } from './usePagamento';
import { useEntrega } from './useEntrega';
import type { FreteCalculoEntregaApi } from '@/components/checkout/entrega';
import { buildCheckoutInfoFromPagamento } from '@/utils/checkoutFromPagamentoInfo';
import {
  executarFinalizarCheckout,
  tratarErroFinalizarCheckout,
} from '@/utils/checkoutExecutarFinalizar';
import type { OpcoesFinalizarCheckout } from '@/types/checkout';

export type { OpcoesFinalizarCheckout } from '@/types/checkout';

/**
 * Checkout: uma instância de `useEntrega` e uma de `usePagamento` compartilhadas
 * entre o resumo e `handleFinalizarCompra` (sem segundo `useEntrega` na árvore).
 */
export function useCheckout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [data, setData] = useState<ICheckoutInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [finalizando, setFinalizando] = useState<boolean>(false);

  const carrinho = useAppSelector((state) => state.carrinho.data);
  const usuario = useAppSelector((state) => state.auth.user);

  const entrega = useEntrega();
  const {
    freteSelecionado,
    selecionarFrete,
    calcularFrete,
    freteCalculado,
    loading: entregaLoading,
    error: entregaError,
    formatarCep,
    validarCep,
  } = entrega;

  const entregaParaFreteCalculo: FreteCalculoEntregaApi = useMemo(
    () => ({
      calcularFrete,
      freteCalculado,
      loading: entregaLoading,
      error: entregaError,
      formatarCep,
      validarCep,
    }),
    [calcularFrete, freteCalculado, entregaLoading, entregaError, formatarCep, validarCep],
  );

  const {
    cuponsAplicados,
    pagamentosParciais,
    solicitarAutorizacaoFinanceiraCheckout,
    aplicarCupom,
    removerCupom,
    adicionarPagamentoParcial,
    removerPagamentoParcial,
  } = usePagamento();

  const pagamentoService = useMemo(() => new PagamentoServiceApi(), []);

  const carregarCheckoutInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const infoPagamento = await pagamentoService.obterPagamentoInfo();
      setData(buildCheckoutInfoFromPagamento(infoPagamento, carrinho));
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar informações de checkout'));
      setLoading(false);
    }
  }, [carrinho, pagamentoService]);

  useEffect(() => {
    void carregarCheckoutInfo();
  }, [carregarCheckoutInfo]);

  const handleFinalizarCompra = useCallback(
    async (opcoes?: OpcoesFinalizarCheckout) => {
      if (!carrinho || !usuario) {
        setError(new Error('Carrinho vazio ou usuário não autenticado'));
        return;
      }

      setFinalizando(true);
      setError(null);

      try {
        await executarFinalizarCheckout({
          carrinho,
          usuario,
          cuponsAplicados,
          pagamentosParciais,
          freteSelecionado,
          opcoes,
          solicitarAutorizacaoFinanceiraCheckout,
          dispatch,
          navigate,
        });
      } catch (err: unknown) {
        tratarErroFinalizarCheckout(err, setError);
      } finally {
        setFinalizando(false);
      }
    },
    [
      carrinho,
      usuario,
      cuponsAplicados,
      pagamentosParciais,
      freteSelecionado,
      solicitarAutorizacaoFinanceiraCheckout,
      dispatch,
      navigate,
    ],
  );

  return {
    data,
    loading,
    error,
    finalizando,
    handleFinalizarCompra,
    recarregar: carregarCheckoutInfo,
    cuponsAplicados,
    pagamentosParciais,
    aplicarCupom,
    removerCupom,
    adicionarPagamentoParcial,
    removerPagamentoParcial,
    freteSelecionado,
    selecionarFrete,
    entregaParaFreteCalculo,
  };
}
