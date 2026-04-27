import styles from './CheckoutSplitPagamento.module.css';
import { Check, Trash2 } from 'lucide-react';
import type { LinhaPagamentoCheckout } from '@/types/checkout';

type Props = {
  linha: LinhaPagamentoCheckout;
  idx: number;
  validada: boolean;
  linhasCount: number;
  onRemoverLinha: (id: string) => void;
};

export const LinhaPagamentoHeader = ({
  linha,
  idx,
  validada,
  linhasCount,
  onRemoverLinha,
}: Props) => {
  return (
    <div className={styles.linhaHeader}>
      <span className={styles.tipoLabel}>
        {linha.tipo === 'pix'
          ? 'PIX'
          : linha.tipo === 'cartao_novo'
            ? 'Novo cartão'
            : 'Cartão salvo'}
      </span>
      {validada ? (
        <span className={styles.linhaCheck} aria-hidden>
          <Check size={18} strokeWidth={2.5} />
        </span>
      ) : null}
      {linhasCount > 1 ? (
        <button
          type="button"
          className={styles.removerBtn}
          onClick={() => onRemoverLinha(linha.id)}
          aria-label="Remover linha"
          data-cy={`checkout-split-remove-line-${idx}`}
        >
          <Trash2 size={16} aria-hidden />
          Remover
        </button>
      ) : null}
    </div>
  );
};
