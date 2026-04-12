import { useState, useMemo, useCallback, useRef } from 'react';
import type { LinhaPagamentoCheckout } from '@/types/checkout';
import type { ICheckoutInfo } from '@/interfaces/checkout';

interface ResumoFinanceiro {
  total: number;
}

interface UseOrquestradorFinalizacaoProps {
  dadosCheckout: ICheckoutInfo;
  resumoFinanceiro: ResumoFinanceiro;
}

/**
 * Hook de Orquestração da Finalização de Compra (Checkout Bounded Context).
 * Gerencia a composição do pagamento e a cobertura do saldo devedor.
 */
export function useOrquestradorFinalizacao({
  dadosCheckout,
  resumoFinanceiro,
}: UseOrquestradorFinalizacaoProps) {
  const [composicaoManual, setComposicaoManual] = useState<LinhaPagamentoCheckout[]>([]);
  const idLinhaUnica = useRef<string>(crypto.randomUUID());

  /**
   * Se o usuário ainda não adicionou múltiplas linhas, mantemos uma linha única
   * que segue o valor total do resumo financeiro automaticamente (sem useEffect).
   */
  const composicaoPagamento = useMemo(() => {
    if (composicaoManual.length > 1) return composicaoManual;

    const id = composicaoManual[0]?.id || idLinhaUnica.current;
    const tipoBase = dadosCheckout.cartoesSalvos.length > 0 ? 'cartao_salvo' : 'cartao_novo';
    const base: LinhaPagamentoCheckout = {
      id,
      tipo: composicaoManual[0]?.tipo || tipoBase,
      valor: resumoFinanceiro.total,
      parcelasCartao: composicaoManual[0]?.parcelasCartao || 1,
      cartaoSalvoUuid: composicaoManual[0]?.cartaoSalvoUuid || dadosCheckout.cartoesSalvos[0]?.uuid,
    };
    return [base];
  }, [composicaoManual, resumoFinanceiro.total, dadosCheckout.cartoesSalvos]);

  const totalPago = useMemo(() => 
    composicaoPagamento.reduce((s, l) => s + (Number.isFinite(l.valor) ? l.valor : 0), 0)
  , [composicaoPagamento]);

  const saldoDevedor = Math.max(0, resumoFinanceiro.total - totalPago);
  const isSaldoCoberto = Math.abs(resumoFinanceiro.total - totalPago) < 0.02;

  const atualizarValorMeio = useCallback((id: string, valor: number) => {
    setComposicaoManual(prev => {
      const nova = prev.length === 0 ? [...composicaoPagamento] : prev;
      return nova.map(l => l.id === id ? { ...l, valor } : l);
    });
  }, [composicaoPagamento]);

  const adicionarMeioPagamento = useCallback((tipo: LinhaPagamentoCheckout['tipo']) => {
    setComposicaoManual(prev => {
      const base = prev.length === 0 ? [...composicaoPagamento] : prev;
      const id = crypto.randomUUID();
      const nova: LinhaPagamentoCheckout = { id, tipo, valor: 0, parcelasCartao: 1 };
      return [...base, nova];
    });
  }, [composicaoPagamento]);

  const removerMeioPagamento = useCallback((id: string) => {
    setComposicaoManual(prev => {
      if (prev.length <= 1) return [];
      return prev.filter(l => l.id !== id);
    });
  }, []);

  const atualizarMeio = useCallback((id: string, patch: Partial<LinhaPagamentoCheckout>) => {
    setComposicaoManual(prev => {
      const base = prev.length === 0 ? [...composicaoPagamento] : prev;
      return base.map(l => l.id === id ? { ...l, ...patch } : l);
    });
  }, [composicaoPagamento]);

  return {
    composicaoPagamento,
    totalPago,
    saldoDevedor,
    isSaldoCoberto,
    atualizarValorMeio,
    adicionarMeioPagamento,
    removerMeioPagamento,
    atualizarMeio
  };
}
