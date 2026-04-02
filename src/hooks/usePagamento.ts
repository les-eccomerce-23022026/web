import { useState, useCallback, useMemo } from 'react';
import { PagamentoServiceApi } from '@/services/api/PagamentoServiceApi';
import type {
  IPagamentoInfo,
  IPagamentoSelecionado,
  IPagamentoDetalhes,
  ICupomAplicado,
  IProcessarPagamentoInput,
  IProcessarPagamentoResultado,
} from '@/interfaces/IPagamento';
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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [processando, setProcessando] = useState<boolean>(false);

  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<IPagamentoSelecionado | null>(null);
  const [cuponsAplicados, setCuponsAplicados] = useState<ICupomAplicado[]>([]);
  const [pagamentosParciais, setPagamentosParciais] = useState<{ cartaoUuid: string; valor: number }[]>([]);

  const service = useMemo(() => new PagamentoServiceApi(), []);

  const carregarInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await service.obterPagamentoInfo();
      setInfo(dados);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar informações de pagamento'));
    } finally {
      setLoading(false);
    }
  }, [service]);

  const selecionarPagamento = useCallback(
    async (dados: IPagamentoSelecionado): Promise<IPagamentoDetalhes | null> => {
      setError(null);
      try {
        const resultado = await service.definirMetodoLiquidacao(dados);
        setPagamentoSelecionado(dados);
        return resultado;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao selecionar forma de pagamento'));
        return null;
      }
    },
    [service],
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

  const adicionarPagamentoParcial = useCallback((cartaoUuid: string, valor: number) => {
    if (!validarValorParcial(valor)) {
      setError(new Error('Valor mínimo por cartão é R$ 10,00'));
      return false;
    }
    setPagamentosParciais((prev) => [...prev, { cartaoUuid, valor }]);
    return true;
  }, []);

  const removerPagamentoParcial = useCallback((index: number) => {
    setPagamentosParciais((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const solicitarAutorizacaoFinanceiraCheckout = useCallback(
    async (
      vendaUuid: string,
      valorTotal: number,
      pagamentosOverride?: { cartaoUuid: string; valor: number }[],
    ): Promise<IProcessarPagamentoResultado | null> => {
      setProcessando(true);
      setError(null);
      try {
        const pagamentosCartao = montarPagamentosCartaoParaAutorizacao(
          pagamentosOverride,
          pagamentosParciais,
          pagamentoSelecionado,
          valorTotal,
        );
        const dados: IProcessarPagamentoInput = {
          vendaUuid,
          pagamentosCartao,
          cuponsAplicados,
          valorTotal,
        };
        const resultado = await service.solicitarAutorizacaoFinanceiraCheckout(dados);
        if (resultado.sucesso) {
          setPagamentosParciais([]);
        }
        return resultado;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao processar pagamento'));
        return null;
      } finally {
        setProcessando(false);
      }
    },
    [service, pagamentoSelecionado, cuponsAplicados, pagamentosParciais],
  );

  const limpar = useCallback(() => {
    setInfo(null);
    setPagamentoSelecionado(null);
    setCuponsAplicados([]);
    setPagamentosParciais([]);
    setError(null);
  }, []);

  return {
    info,
    loading,
    error,
    processando,
    pagamentoSelecionado,
    cuponsAplicados,
    pagamentosParciais,
    carregarInfo,
    selecionarPagamento,
    aplicarCupom,
    removerCupom,
    adicionarPagamentoParcial,
    removerPagamentoParcial,
    solicitarAutorizacaoFinanceiraCheckout,
    limpar,
    validarCartao,
    detectarBandeira,
    validarLuhn,
  };
}
