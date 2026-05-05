import { useEffect, useMemo, useRef } from 'react';
import type { AppDispatch } from '../store';
import { limparCotacaoFreteCarrinho } from '../store/slices/cotacaoFreteSlice';
import { assinaturaItensCarrinho } from '../utils/carrinhoAssinatura';
import { useEntrega } from './useEntrega';
import type { FreteCalculoEntregaApi } from '../components/FinalizarCompra/Entrega';
import type { ICarrinho } from '../interfaces/carrinho';
import type { CotacaoFretePersistida } from '../store/slices/cotacaoFreteSlice';

interface UseFinalizarCompraFreteParams {
  carrinho: ICarrinho | null;
  cotacaoPersistida: CotacaoFretePersistida | null;
  dispatch: AppDispatch;
}

export function useFinalizarCompraFrete({
  carrinho,
  cotacaoPersistida,
  dispatch,
}: UseFinalizarCompraFreteParams) {
  const entrega = useEntrega();
  const freteHidratacaoRef = useRef<string | null>(null);

  useEffect(() => {
    if (!carrinho || !cotacaoPersistida) {
      freteHidratacaoRef.current = null;
      return;
    }

    const assinatura = assinaturaItensCarrinho(carrinho);
    const subtotalValido = Math.abs(cotacaoPersistida.subtotalCotado - carrinho.resumo.subtotal) < 0.005;
    const assinaturaValida = cotacaoPersistida.assinaturaItens === assinatura && assinatura.length > 0;

    if (!assinaturaValida || !subtotalValido) {
      freteHidratacaoRef.current = null;
      dispatch(limparCotacaoFreteCarrinho());
      return;
    }

    const chave = `${cotacaoPersistida.opcaoSelecionada.uuid}:${assinatura}:${cotacaoPersistida.subtotalCotado}`;
    if (freteHidratacaoRef.current === chave) return;
    freteHidratacaoRef.current = chave;

    entrega.hidratarFrete({
      freteCalculado: cotacaoPersistida.freteCalculado,
      opcao: cotacaoPersistida.opcaoSelecionada,
      cep: cotacaoPersistida.cepDestino,
    });
  }, [carrinho, cotacaoPersistida, dispatch, entrega]);

  const entregaParaFreteCalculo: FreteCalculoEntregaApi = useMemo(
    () => ({
      calcularFrete: entrega.calcularFrete,
      freteCalculado: entrega.freteCalculado,
      loading: entrega.loading,
      error: entrega.error,
      formatarCep: entrega.formatarCep,
      validarCep: entrega.validarCep,
    }),
    [entrega],
  );

  return {
    freteSelecionado: entrega.freteSelecionado,
    selecionarFrete: entrega.selecionarFrete,
    entregaParaFreteCalculo,
    cepDestino: entrega.cepDestino,
  };
}
