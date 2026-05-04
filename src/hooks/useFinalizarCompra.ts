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
import { useNotification } from '@/components/Comum/Notification';
import type { IEntregaInputDto } from '@/interfaces/entrega';
import { EntregaServiceApi } from '@/services/api/entregaServiceApi';

export type { OpcoesFinalizarCheckout } from '@/types/checkout';

/**
 * Finalizar compra: uma instância de `useEntrega` e uma de `usePagamento` compartilhadas
 * entre o resumo e `handleFinalizarCompra` (sem segundo `useEntrega` na árvore).
 */
export function useFinalizarCompra() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [data, setData] = useState<ICheckoutInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [finalizando, setFinalizando] = useState<boolean>(false);
  const { showError } = useNotification();

  const carrinho = useAppSelector((state) => state.carrinho.data);
  const carrinhoStatus = useAppSelector((state) => state.carrinho.status);
  const usuario = useAppSelector((state) => state.auth.user);
  const cotacaoPersistida = useAppSelector((state) => state.cotacaoFrete.cotacao);

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
      if (import.meta.env.DEV) {
        console.debug('[useFinalizarCompra] hidratação frete ignorada', {
          assinaturaOk,
          subtotalOk,
          cotacaoAssinatura: cotacaoPersistida.assinaturaItens,
          carrinhoAssinatura: assinatura,
        });
      }
      freteHidratacaoRef.current = null;
      dispatch(limparCotacaoFreteCarrinho());
      return;
    }

    const chave = `${cotacaoPersistida.opcaoSelecionada.uuid}:${assinatura}:${cotacaoPersistida.subtotalCotado}`;
    if (freteHidratacaoRef.current === chave) return;
    freteHidratacaoRef.current = chave;

    if (import.meta.env.DEV) {
      console.debug('[useFinalizarCompra] hidratar frete do Redux', {
        opcao: cotacaoPersistida.opcaoSelecionada.tipo,
        cep: cotacaoPersistida.cepDestino,
      });
    }

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
      loading: entregaLoading,
      error: entregaError,
      formatarCep,
      validarCep,
    }),
    [calcularFrete, freteCalculado, entregaLoading, entregaError, formatarCep, validarCep],
  );

  const {
    cuponsAplicados,
    parcelasLiquidacao,
    aplicarCupom,
    removerCupom,
    adicionarParcelaLiquidacao,
    removerParcelaLiquidacao,
    definirParcelasLiquidacao,
  } = usePagamento();

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
    } catch (err) {
      if (import.meta.env.DEV) {
        console.debug('[useFinalizarCompra] GET /pagamento/info falhou', err);
      }
      setError(err instanceof Error ? err : new Error('Erro ao carregar informações de checkout'));
    } finally {
      setLoading(false);
    }
  }, [carrinho, carrinhoStatus]);

  useEffect(() => {
    if (data && carrinho && data.resumoPedido.subtotal === carrinho.resumo.subtotal) {
      setLoading(false);
      return;
    }

    if (carrinhoStatus === 'succeeded') {
      if (carrinho?.itens?.length) {
        void carregarInformacoesFinalizarCompra();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(true);
    }
  }, [carregarInformacoesFinalizarCompra, data, carrinho, carrinhoStatus]);

  const handleFinalizarCompra = useCallback(
    async (opcoes?: OpcoesFinalizarCheckout) => {
      if (!carrinho || !usuario) {
        setError(new Error('Carrinho vazio ou usuário não autenticado'));
        return;
      }

      /** Congelar antes de `setFinalizando`: evita que efeitos limpem o frete antes do snapshot usado em POST /entregas. */
      const freteParaEntrega = freteSelecionado;
      if (!freteParaEntrega) {
        showError('Selecione uma opção de frete.');
        return;
      }

      setFinalizando(true);
      setError(null);

      try {
        await executarFinalizarCheckout({
          carrinho,
          usuario,
          cuponsAplicados,
          parcelasLiquidacao,
          freteSelecionado: freteParaEntrega,
          opcoes,
          dispatch,
          navigate,
          pagamentoService: PagamentoService,
          checkoutData: data,
          cadastrarEntrega: async (vendaUuid, endereco, custoFreteRegistradoNaVenda) => {
            const dados: IEntregaInputDto = {
              vendaUuid,
              tipoFrete: freteParaEntrega.tipo,
              endereco,
              custo: custoFreteRegistradoNaVenda,
            };
            return new EntregaServiceApi().cadastrarEntrega(dados);
          },
          onSalvarCartaoCheckoutFalhou: (erro) => {
            showError(
              `Pedido concluído com sucesso, mas o cartão não foi salvo no perfil: ${erro.message}. Você pode cadastrar o cartão em Meu Perfil.`,
            );
          },
        });
      } catch (err: unknown) {
        tratarErroFinalizarCheckout(err, setError, showError);
      } finally {
        setFinalizando(false);
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
      showError,
    ],
  );

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
