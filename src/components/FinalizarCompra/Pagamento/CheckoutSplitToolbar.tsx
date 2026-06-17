import type { LinhaPagamentoCheckout } from '@/types/checkout';
import styles from './CheckoutSplitPagamento.style.module.css';

type Props = {
  totalCartoesSalvos: number;
  onAdicionarLinha: (tipo: LinhaPagamentoCheckout['tipo']) => void;
};

export const CheckoutSplitToolbar = ({ totalCartoesSalvos, onAdicionarLinha }: Props) => {
  return (
    <div className={styles.toolbar} data-cy="pagamento-dividido-barra-ferramentas">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => onAdicionarLinha('cartao_salvo')}
        disabled={totalCartoesSalvos === 0}
        data-cy="pagamento-dividido-adicionar-cartao-salvo"
      >
        + Cartão salvo
      </button>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => onAdicionarLinha('cartao_novo')}
        data-cy="pagamento-dividido-adicionar-novo-cartao"
      >
        + Novo cartão
      </button>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => onAdicionarLinha('pix')}
        data-cy="pagamento-dividido-adicionar-pix"
      >
        + PIX
      </button>
    </div>
  );
};
