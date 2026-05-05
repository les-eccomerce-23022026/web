'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { FreteCalculoEntregaApi } from '@/components/FinalizarCompra/Entrega';
import { useEntrega } from '@/hooks/useEntrega';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  limparCotacaoFreteCarrinho,
} from '@/store/slices/cotacaoFreteSlice';
import { USE_MOCK } from '@/config/apiConfig';
import { CarrinhoTabela } from './CarrinhoTabela';
import { CarrinhoResumo } from './CarrinhoResumo';
import { CarrinhoVazio } from './CarrinhoVazio';
import { useCarrinhoHandlers } from './useCarrinhoHandlers';
import { useCarrinhoFrete } from './useCarrinhoFrete';
import '@/pages-react-router/Vendas/Carrinho/style.module.css';

export const Carrinho = () => {
  const dispatch = useAppDispatch();
  const { data, error, status } = useAppSelector((state) => state.carrinho);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const usarCarrinhoLocal = USE_MOCK || !isAuthenticated;

  const entrega = useEntrega();
  const {
    freteSelecionado,
    calcularFrete,
    freteCalculado,
    loading: entregaLoading,
    error: entregaError,
    formatarCep,
    validarCep,
    limparFrete,
    cepDestino,
    selecionarFrete,
  } = entrega;

  const { handleUpdateQuantidade, handleRemover } = useCarrinhoHandlers(usarCarrinhoLocal);
  const { handleFreteSelecionado, carrinhoAssinatura } = useCarrinhoFrete(
    { selecionarFrete, freteCalculado, cepDestino, limparFrete },
    data,
  );

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

  const prevCarrinhoAssinaturaRef = useRef<string | null>(null);

  useEffect(() => {
    if (!carrinhoAssinatura) {
      prevCarrinhoAssinaturaRef.current = null;
      return;
    }
    if (prevCarrinhoAssinaturaRef.current === carrinhoAssinatura) return;
    if (prevCarrinhoAssinaturaRef.current !== null) {
      limparFrete();
      dispatch(limparCotacaoFreteCarrinho());
    }
    prevCarrinhoAssinaturaRef.current = carrinhoAssinatura;
  }, [carrinhoAssinatura, limparFrete, dispatch]);

  if (status === 'loading') {
    return (
      <div className="carrinho-page">
        <h1 className="page-title">Carrinho de Compras</h1>
        <hr className="carrinho-separator" />
        <p>Carregando carrinho...</p>
      </div>
    );
  }
  if (status === 'failed' || error) {
    return (
      <div className="carrinho-page">
        <h1 className="page-title">Carrinho de Compras</h1>
        <hr className="carrinho-separator" />
        <p className="carrinho-status-message">Erro ao carregar carrinho.</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="carrinho-page">
        <h1 className="page-title">Carrinho de Compras</h1>
        <hr className="carrinho-separator" />
        <p>Carregando carrinho...</p>
      </div>
    );
  }
  if (data.itens.length === 0) {
    return (
      <>
        <h1 className="page-title">Carrinho de Compras</h1>
        <hr className="carrinho-separator" />
        <CarrinhoVazio />
      </>
    );
  }


  return (
    <div className="carrinho-page">
      <h1 className="page-title">Carrinho de Compras</h1>
      <hr className="carrinho-separator" />

      <CarrinhoTabela
        itens={data.itens}
        onUpdateQuantidade={handleUpdateQuantidade}
        onRemover={handleRemover}
      />

      <CarrinhoResumo
        subtotal={data.resumo.subtotal}
        frete={data.resumo.frete}
        total={data.resumo.total}
        entrega={entregaParaFreteCalculo}
        freteSelecionado={freteSelecionado}
        onFreteSelecionado={handleFreteSelecionado}
      />
    </div>
  );
};
