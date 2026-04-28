import { useState, useEffect, useMemo } from 'react';
import type { LinhaPagamentoCheckout } from '@/types/checkout';
import type { ICartaoCreditoInput } from '@/interfaces/pagamento';

type LinhasPagamentoManagerProps = {
  initialLinhas: LinhaPagamentoCheckout[];
  onChange: (linhas: LinhaPagamentoCheckout[]) => void;
};

export const LinhasPagamentoManager = ({ initialLinhas, onChange }: LinhasPagamentoManagerProps) => {
  const [linhasPagamento] = useState<LinhaPagamentoCheckout[]>(initialLinhas);
  const [novosCartoesPorLinha, setNovosCartoesPorLinha] = useState<Record<string, ICartaoCreditoInput>>({});

  const novosCartoesPorLinhaLimpos = useMemo(() => {
    const ids = new Set(linhasPagamento.filter((l) => l.tipo === 'cartao_novo').map((l) => l.id));
    const hasKeysToRemove = Object.keys(novosCartoesPorLinha).some((k) => !ids.has(k));

    if (!hasKeysToRemove) return novosCartoesPorLinha;
    const next = { ...novosCartoesPorLinha };
    let changed = false;
    for (const k of Object.keys(next)) {
      if (!ids.has(k)) {
        delete next[k];
        changed = true;
      }
    }
    return changed ? next : novosCartoesPorLinha;
  }, [linhasPagamento, novosCartoesPorLinha]);

  useEffect(() => {
    setNovosCartoesPorLinha(novosCartoesPorLinhaLimpos);
  }, [novosCartoesPorLinhaLimpos]);

  useEffect(() => {
    onChange(linhasPagamento);
  }, [linhasPagamento, onChange]);

  return null; // Placeholder - componente simplificado
};
