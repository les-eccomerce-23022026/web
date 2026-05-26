import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { usePagamento } from './usePagamento';
import { useNotification } from '../components/Comum/Notification';
import { useFinalizarCompraFrete } from './useFinalizarCompraFrete';
import { useFinalizarCompraDados } from './useFinalizarCompraDados';
import { useFinalizarCompraAcao } from './useFinalizarCompraAcao';

export type { OpcoesFinalizarCheckout } from '../types/checkout';

/**
 * Finalizar compra: uma instância de `useEntrega` e uma de `usePagamento` compartilhadas
 * entre o resumo e `handleFinalizarCompra` (sem segundo `useEntrega` na árvore).
 */
export function useFinalizarCompra() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [finalizando, setFinalizando] = useState<boolean>(false);
  const { showError } = useNotification();

  const carrinho = useAppSelector((state) => state.carrinho.data);
  const carrinhoStatus = useAppSelector((state) => state.carrinho.status);
  const usuario = useAppSelector((state) => state.auth.user);
  const cotacaoPersistida = useAppSelector((state) => state.cotacaoFrete.cotacao);

  const {
    freteSelecionado,
    selecionarFrete,
    entregaParaFreteCalculo,
    cepDestino,
  } = useFinalizarCompraFrete({ carrinho, cotacaoPersistida, dispatch });

  const {
    data,
    loading,
    error,
    definirErroCheckout,
    carregarInformacoesFinalizarCompra,
  } = useFinalizarCompraDados({ carrinho, carrinhoStatus });

  const {
    cuponsAplicados,
    parcelasLiquidacao,
    aplicarCupom,
    removerCupom,
    adicionarParcelaLiquidacao,
    removerParcelaLiquidacao,
    definirParcelasLiquidacao,
  } = usePagamento();

  const handleFinalizarCompra = useFinalizarCompraAcao({
    carrinho,
    usuario,
    freteSelecionado,
    cuponsAplicados,
    parcelasLiquidacao,
    dispatch,
    router,
    data,
    showError,
    definirErroCheckout,
    definirFinalizando: setFinalizando,
  });

  return useMemo(() => ({
    data,
    loading,
    error,
    finalizando,
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
  }), [
    data, loading, error, finalizando, handleFinalizarCompra, 
    carregarInformacoesFinalizarCompra, cuponsAplicados, parcelasLiquidacao,
    aplicarCupom, removerCupom, adicionarParcelaLiquidacao, 
    removerParcelaLiquidacao, definirParcelasLiquidacao, 
    freteSelecionado, selecionarFrete, entregaParaFreteCalculo, cepDestino
  ]);
}
