import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PagamentoService } from '@/services/pagamentoService';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { limparCotacaoFreteCarrinho } from '@/store/slices/cotacaoFreteSlice';
import { assinaturaItensCarrinho } from '@/utils/carrinhoAssinatura';
import type { ICheckoutInfo } from '@/interfaces/checkout';
import { usePagamento } from './usePagamento';
import { useEntrega } from './useEntrega';
import type { FreteCalculoEntregaApi } from '@/components/FinalizarCompra/Entrega';
import { buildCheckoutInfoFromPagamento } from '@/utils/finalizarCompraFromPagamentoInfo';
import {
  executarFinalizarCheckout,
  tratarErroFinalizarCheckout,
} from '@/utils/executarFinalizacaoCompra';
import type { OpcoesFinalizarCheckout } from '@/types/checkout';

export type { OpcoesFinalizarCheckout } from '@/types/checkout';

/**
 * Finalizar compra: uma instância de `useEntrega` e uma de `usePagamento` compartilhadas
 * entre o resumo e `handleFinalizarCompra` (sem segundo `useEntrega` na árvore).
 */
export function useFinalizarCompra() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [data, setData] = useState<ICheckoutInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFinalizando, setIsFinalizando] = useState<boolean>(false);

  const hasError = error !== null;

  const carrinho = useAppSelector((state) => state.carrinho.data);
  const usuario = useAppSelector((state) => state.auth.user);
  const cotacaoPersistida = useAppSelector((state) => state.cotacaoFrete.cotacao);

  const entrega = useEntrega();
  const {
    freteSelecionado,
    selecionarFrete,
    calcularFrete,
    freteCalculado,
    isLoading: isEntregaLoading,
    hasError: hasEntregaError,
    formatarCep,
    validarCep,
    cadastrarEntrega,
    hidratarFrete,
    cepDestino,
  } = entrega;

  const freteHidratacaoRef = useRef<string | null>(null);

  useEffect(() => {
    if (!carrinho || !cotacaoPersistida) {
      freteHidratacaoRef.current = null;
      return;
    }
    const assinatura = assinaturaItensCarrinho(carrinho);
    const EPS = 0.005;
    const subtotalOk =
      Math.abs(cotacaoPersistida.subtotalCotado - carrinho.resumo.subtotal) < EPS;
    const assinaturaOk =
      cotacaoPersistida.assinaturaItens === assinatura && assinatura.length > 0;

    if (!assinaturaOk || !subtotalOk) {
      freteHidratacaoRef.current = null;
      dispatch(limparCotacaoFreteCarrinho());
      return;
    }

    const chave = `${cotacaoPersistida.opcaoSelecionada.uuid}:${assinatura}:${cotacaoPersistida.subtotalCotado}`;
    if (freteHidratacaoRef.current === chave) return;
    freteHidratacaoRef.current = chave;

    hidratarFrete({
      freteCalculado: cotacaoPersistida.freteCalculado,
      opcao: cotacaoPersistida.opcaoSelecionada,
      cep: cotacaoPersistida.cepDestino,
    });
  }, [carrinho, cotacaoPersistida, dispatch, hidratarFrete]);

  const entregaParaFreteCalculo: FreteCalculoEntregaApi = useMemo(
    () => ({
      calcularFrete,
      freteCalculado,
      isLoading: isEntregaLoading,
      hasError: hasEntregaError,
      error: hasEntregaError ? new Error('Erro ao calcular frete') : null, // Fallback para objeto Error
      formatarCep,
      validarCep,
    }),
    [calcularFrete, freteCalculado, isEntregaLoading, hasEntregaError, formatarCep, validarCep],
  );

  const {
    cuponsAplicados,
    parcelasLiquidacao,
    aplicarCupom,
    removerCupom,
    adicionarParcelaLiquidacao,
    removerParcelaLiquidacao,
    definirParcelasLiquidacao,
    solicitarAutorizacaoFinanceiraCheckout,
  } = usePagamento();

  const carregarInformacoesFinalizarCompra = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const infoPagamento = await PagamentoService.obterPagamentoInfo();
      setData(buildCheckoutInfoFromPagamento(infoPagamento, carrinho));
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar informações de checkout'));
      setIsLoading(false);
    }
  }, [carrinho]);

  useEffect(() => {
    void carregarInformacoesFinalizarCompra();
  }, [carregarInformacoesFinalizarCompra]);

  const handleFinalizarCompra = useCallback(
    async (opcoes?: OpcoesFinalizarCheckout) => {
      if (!carrinho || !usuario) {
        setError(new Error('Carrinho vazio ou usuário não autenticado'));
        return;
      }

      setIsFinalizando(true);
      setError(null);

      try {
        await executarFinalizarCheckout({
          carrinho,
          usuario,
          cuponsAplicados,
          parcelasLiquidacao,
          freteSelecionado,
          opcoes,
          dispatch,
          navigate,
          pagamentoService: PagamentoService,
          solicitarAutorizacaoFinanceiraCheckout,
          checkoutData: data,
          cadastrarEntrega,
          onSalvarCartaoCheckoutFalhou: (erro) => {
            alert(
              `Pedido concluído com sucesso, mas o cartão não foi salvo no perfil: ${erro.message}. Você pode cadastrar o cartão em Meu Perfil.`,
            );
          },
        });
      } catch (err: unknown) {
        tratarErroFinalizarCheckout(err, setError);
      } finally {
        setIsFinalizando(false);
      }
    },
    [
      carrinho,
      usuario,
      cuponsAplicados,
      parcelasLiquidacao,
      freteSelecionado,
      dispatch,
      navigate,
      data,
      cadastrarEntrega,
    ],
  );

  return {
    data,
    isLoading,
    hasError,
    error,
    isFinalizando,
    handleFinalizarCompra,
    recarregar: carregarInformacoesFinalizarCompra,
    cuponsAplicados,
    parcelasLiquidacao,
    aplicarCupom,
    removerCupom,
    adicionarParcelaLiquidacao,
    removerParcelaLiquidacao,
    definirParcelasLiquidacao,
    freteSelecionado,
    selecionarFrete,
    entregaParaFreteCalculo,
    cepDestinoFrete: cepDestino,
  };
}

