import { useMemo, useCallback } from 'react';
import type { LinhaPagamentoCheckout } from '@/types/checkout';

const EPSILON_ALINHAMENTO = 0.02;

interface UseGerenciadorLinhasPagamentoProps {
  totalAposCupons: number;
  linhas: LinhaPagamentoCheckout[];
  onLinhasChange: (linhas: LinhaPagamentoCheckout[]) => void;
  primeiroCartaoSalvoUuid?: string;
}

/**
 * Hook para gerenciar as linhas de pagamento na divisão de checkout (Split Payment).
 * Encapsula a lógica de adicionar, remover e calcular a cobertura do total.
 */
export function useGerenciadorLinhasPagamento({
  totalAposCupons,
  linhas,
  onLinhasChange,
  primeiroCartaoSalvoUuid,
}: UseGerenciadorLinhasPagamentoProps) {
  
  const somaLinhas = useMemo(() => 
    linhas.reduce((acc, linha) => acc + (Number.isFinite(linha.valor) ? linha.valor : 0), 0)
  , [linhas]);

  const restante = totalAposCupons - somaLinhas;
  const isAlinhado = Math.abs(restante) < EPSILON_ALINHAMENTO;

  const percentualCoberto = useMemo(() => {
    if (totalAposCupons <= EPSILON_ALINHAMENTO) return 100;
    return Math.min(100, (somaLinhas / totalAposCupons) * 100);
  }, [somaLinhas, totalAposCupons]);

  const atualizarLinha = useCallback((id: string, patch: Partial<LinhaPagamentoCheckout>) => {
    onLinhasChange(linhas.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, [linhas, onLinhasChange]);

  const removerLinha = useCallback((id: string) => {
    if (linhas.length <= 1) return;
    onLinhasChange(linhas.filter((l) => l.id !== id));
  }, [linhas, onLinhasChange]);

  const adicionarLinha = useCallback((tipo: LinhaPagamentoCheckout['tipo']) => {
    const id = crypto.randomUUID();
    
    if (tipo === 'cartao_salvo' && !primeiroCartaoSalvoUuid) {
      return;
    }

    const novaLinha: LinhaPagamentoCheckout = (() => {
      if (tipo === 'pix') return { id, tipo: 'pix', valor: 0 };
      if (tipo === 'cartao_novo') return { id, tipo: 'cartao_novo', valor: 0, parcelasCartao: 1 };
      return { id, tipo: 'cartao_salvo', cartaoSalvoUuid: primeiroCartaoSalvoUuid!, valor: 0, parcelasCartao: 1 };
    })();

    onLinhasChange([...linhas, novaLinha]);
  }, [linhas, onLinhasChange, primeiroCartaoSalvoUuid]);

  return {
    somaLinhas,
    restante,
    isAlinhado,
    percentualCoberto,
    atualizarLinha,
    removerLinha,
    adicionarLinha
  };
}
