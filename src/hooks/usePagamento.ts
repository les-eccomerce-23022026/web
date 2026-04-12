import { useState, useCallback } from 'react';
import { PagamentoService } from '@/services/pagamentoService';
import type {
  IPagamentoInfo,
  IPagamentoSelecionado,
  IPagamentoDetalhes,
  ICupomAplicado,
  IPagamentoParcial,
  IProcessarPagamentoInput,
  IProcessarPagamentoResultado,
} from '@/interfaces/pagamento';
import {
  validarCartao,
  detectarBandeira,
  validarLuhn,
  validarValorParcial,
} from '@/utils/cartaoValidacao';
import { montarPagamentosCartaoParaAutorizacao } from '@/utils/pagamentoMontarPagamentos';

export {
  validarLuhn,
  detectarBandeira,
  validarCartao,
  validarValorParcial,
} from '@/utils/cartaoValidacao';

/**
 * Hook para gerenciamento de pagamento no checkout
 */
export function usePagamento() {
  const [info, setInfo] = useState<IPagamentoInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isProcessando, setIsProcessando] = useState<boolean>(false);

  const hasError = error !== null;

  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<IPagamentoSelecionado | null>(null);
  const [cuponsAplicados, setCuponsAplicados] = useState<ICupomAplicado[]>([]);
  const [parcelasLiquidacao, setParcelasLiquidacao] = useState<IPagamentoParcial[]>([]);

  const carregarInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dados = await PagamentoService.obterPagamentoInfo();
      setInfo(dados);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar informações de pagamento'));
    } finally {
      setIsLoading(false);
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
        setError(err instanceof Error ? err : new Error('Erro ao selecionar forma de pagamento'));
        return null;
      }
    },
    [],
  );

  const aplicarCupom = useCallback(
    (cupom: ICupomAplicado) => {
      if (cupom.tipo === 'promocional') {
        const outrosPromocionais = cuponsAplicados.filter((c) => c.tipo === 'promocional');
        if (outrosPromocionais.length > 0) {
          setError(new Error('Apenas um cupom promocional é permitido por compra'));
          return false;
        }
      }
      setCuponsAplicados((prev) => [...prev, cupom]);
      return true;
    },
    [cuponsAplicados],
  );

  const removerCupom = useCallback((cupomUuid: string) => {
    setCuponsAplicados((prev) => prev.filter((c) => c.uuid !== cupomUuid));
  }, []);

  const adicionarParcelaLiquidacao = useCallback((referenciaMeioPagamento: string, valor: number) => {
    if (!validarValorParcial(valor)) {
      setError(new Error('Valor mínimo por cartão é R$ 10,00'));
      return false;
    }
    setParcelasLiquidacao((prev) => [...prev, { referenciaMeioPagamento, valor }]);
    return true;
  }, []);

  const removerParcelaLiquidacao = useCallback((index: number) => {
    setParcelasLiquidacao((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const definirParcelasLiquidacao = useCallback((lista: IPagamentoParcial[]) => {
    setParcelasLiquidacao(lista);
  }, []);

  const solicitarAutorizacaoFinanceiraCheckout = useCallback(
    async (
      vendaUuid: string,
      valorTotal: number,
      pagamentosOverride?: IPagamentoParcial[],
    ): Promise<IProcessarPagamentoResultado | null> => {
      setIsProcessando(true);
      setError(null);
      try {
        const pagamentosCartao = montarPagamentosCartaoParaAutorizacao(
          pagamentosOverride,
          parcelasLiquidacao,
          pagamentoSelecionado,
          valorTotal,
        );
        const intencao = await PagamentoService.registrarIntencaoPagamento(valorTotal);
        const dados: IProcessarPagamentoInput = {
          vendaUuid,
          pagamentosCartao,
          cuponsAplicados,
          valorTotal,
          idIntencao: intencao.idIntencao,
          segredoConfirmacao: intencao.segredoConfirmacao,
        };
        const resultado = await PagamentoService.solicitarAutorizacaoFinanceiraCheckout(dados);
        if (resultado.sucesso) {
          setParcelasLiquidacao([]);
        }
        return resultado;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao processar pagamento'));
        return null;
      } finally {
        setIsProcessando(false);
      }
    },
    [pagamentoSelecionado, cuponsAplicados, parcelasLiquidacao],
  );

  const limpar = useCallback(() => {
    setInfo(null);
    setPagamentoSelecionado(null);
    setCuponsAplicados([]);
    setParcelasLiquidacao([]);
    setError(null);
  }, []);

  return {
    info,
    isLoading,
    hasError,
    error,
    isProcessando,
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
