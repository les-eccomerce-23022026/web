import { useState, useCallback } from 'react';
import { PagamentoService } from '../services/pagamentoService';
import type {
  IPagamentoInfo,
  IPagamentoSelecionado,
  IPagamentoDetalhes,
  IPagamentoParcial,
  IProcessarPagamentoResultado,
} from '../interfaces/pagamento';
import {
  validarCartao,
  detectarBandeira,
  validarLuhn,
} from '../utils/cartaoValidacao';
import { montarPagamentosCartaoParaAutorizacao } from '../utils/pagamentoMontarPagamentos';
import {
  criarInputProcessarPagamento,
  normalizarErroPagamento,
} from './usePagamentoHelpers';
import { usePagamentoCuponsParcelas } from './usePagamentoCuponsParcelas';

export {
  validarLuhn,
  detectarBandeira,
  validarCartao,
  validarValorParcial,
} from '../utils/cartaoValidacao';

export function usePagamento() {
  const [info, setInfo] = useState<IPagamentoInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [processando, setProcessando] = useState<boolean>(false);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<IPagamentoSelecionado | null>(null);
  const {
    cuponsAplicados,
    parcelasLiquidacao,
    aplicarCupom,
    removerCupom,
    adicionarParcelaLiquidacao,
    removerParcelaLiquidacao,
    definirParcelasLiquidacao,
    limparCuponsParcelas,
  } = usePagamentoCuponsParcelas({ definirErro: setError });

  const carregarInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await PagamentoService.obterPagamentoInfo();
      setInfo(dados);
    } catch (err) {
      setError(normalizarErroPagamento(err, 'Erro ao carregar informações de pagamento'));
    } finally {
      setLoading(false);
    }
  }, []);

  const selecionarPagamento = useCallback(
    async (dados: IPagamentoSelecionado): Promise<IPagamentoDetalhes | null> => {
      setError(null);
      try {
        const resultado = await PagamentoService.definirMetodoLiquidacao(dados);
        setPagamentoSelecionado(dados);
        return resultado;
      } catch (err) {
        setError(normalizarErroPagamento(err, 'Erro ao selecionar forma de pagamento'));
        return null;
      }
    },
    [],
  );

  const solicitarAutorizacaoFinanceiraCheckout = useCallback(
    async (
      vendaUuid: string,
      valorTotal: number,
      pagamentosOverride?: IPagamentoParcial[],
    ): Promise<IProcessarPagamentoResultado | null> => {
      setProcessando(true);
      setError(null);
      try {
        const pagamentosCartao = montarPagamentosCartaoParaAutorizacao(
          pagamentosOverride,
          parcelasLiquidacao,
          pagamentoSelecionado,
          valorTotal,
        );
        const intencao = await PagamentoService.registrarIntencaoPagamento(valorTotal);
        const dados = criarInputProcessarPagamento(
          vendaUuid,
          valorTotal,
          pagamentosCartao,
          cuponsAplicados,
          intencao.idIntencao,
          intencao.segredoConfirmacao,
        );
        const resultado = await PagamentoService.solicitarAutorizacaoFinanceiraCheckout(dados);
        if (resultado.sucesso) {
          definirParcelasLiquidacao([]);
        }
        return resultado;
      } catch (err) {
        setError(normalizarErroPagamento(err, 'Erro ao processar pagamento'));
        return null;
      } finally {
        setProcessando(false);
      }
    },
    [pagamentoSelecionado, cuponsAplicados, parcelasLiquidacao, definirParcelasLiquidacao],
  );

  const limpar = useCallback(() => {
    setInfo(null);
    setPagamentoSelecionado(null);
    limparCuponsParcelas();
    setError(null);
  }, [limparCuponsParcelas]);

  return {
    info,
    loading,
    error,
    processando,
    pagamentoSelecionado,
    cuponsAplicados,
    parcelasLiquidacao,
    carregarInfo,
    selecionarPagamento,
    aplicarCupom,
    removerCupom,
    adicionarParcelaLiquidacao,
    removerParcelaLiquidacao,
    definirParcelasLiquidacao,
    solicitarAutorizacaoFinanceiraCheckout,
    limpar,
    validarCartao,
    detectarBandeira,
    validarLuhn,
  };
}
