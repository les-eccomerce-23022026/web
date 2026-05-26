import type { LinhaPagamentoCheckout } from '@/types/checkout';
import styles from './CheckoutSplitPagamento.style.module.css';

type Props = {
  totalCartoesSalvos: number;
  onAdicionarLinha: (tipo: LinhaPagamentoCheckout['tipo']) => void;
};

export const CheckoutSplitToolbar = ({ totalCartoesSalvos, onAdicionarLinha }: Props) => {
  return (
    <div className={styles.toolbar} data-cy="checkout-split-toolbar">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => onAdicionarLinha('cartao_salvo')}
        disabled={totalCartoesSalvos === 0}
        data-cy="checkout-split-add-saved-card"
      >
        + Cartão salvo
      </button>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => onAdicionarLinha('cartao_novo')}
        data-cy="checkout-split-add-new-card"
      >
        + Novo cartão
      </button>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => onAdicionarLinha('pix')}
        data-cy="checkout-split-add-pix"
      >
        + PIX
      </button>
    </div>
  );
};
