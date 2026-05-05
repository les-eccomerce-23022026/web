import { Trash2 } from 'lucide-react';
import type { IPagamentoParcial } from '@/interfaces/pagamento';
import styles from './PagamentoParcialInput.style.module.css';

type ParcelaComNome = IPagamentoParcial & { nomeCartao?: string };

interface PagamentoItemProps {
  pagamento: ParcelaComNome;
  index: number;
  onRemover: (index: number) => void;
}

export const PagamentoItem = ({ pagamento, index, onRemover }: PagamentoItemProps) => {
  const formatarValor = (valor: number) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatarNomeCartao = (nomeCartao: string | undefined, referenciaMeioPagamento: string) => {
    if (nomeCartao) {
      return nomeCartao;
    }
    return `Cartão ${referenciaMeioPagamento.slice(0, 8)}...`;
  };

  return (
    <div
      className={styles['pagamento-item']}
      data-cy={`checkout-partial-payment-${index}`}
    >
      <div className={styles['pagamento-info']}>
        <span className={styles['cartao-nome']}>
          {formatarNomeCartao(pagamento.nomeCartao, pagamento.referenciaMeioPagamento)}
        </span>
        <span className={styles['pagamento-valor']}>
          R$ {formatarValor(pagamento.valor)}
        </span>
      </div>
      <button
        type="button"
        className={styles['remover-pagamento']}
        onClick={() => onRemover(index)}
        data-cy={`checkout-partial-payment-remove-${index}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};
