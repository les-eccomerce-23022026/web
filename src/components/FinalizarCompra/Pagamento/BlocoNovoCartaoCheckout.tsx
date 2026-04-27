import styles from './CheckoutSplitPagamento.module.css';
import type { ICheckoutInfo } from '@/interfaces/checkout';
import type { LinhaPagamentoCheckout } from '@/types/checkout';

type Props = {
  linhaId: string;
  data: ICheckoutInfo;
  uuidsCartoesSalvosEmUso: Set<string>;
  cartaoSalvoLabel: (uuid: string) => string;
  onAtualizarLinha: (id: string, patch: Partial<LinhaPagamentoCheckout>) => void;
  onAbrirModalCartao: (id: string) => void;
};

export const BlocoNovoCartaoCheckout = ({
  linhaId,
  data,
  uuidsCartoesSalvosEmUso,
  cartaoSalvoLabel,
  onAtualizarLinha,
  onAbrirModalCartao,
}: Props) => {
  const disponiveis = data.cartoesSalvos.filter((c) => !uuidsCartoesSalvosEmUso.has(c.uuid));
  
  if (disponiveis.length > 0) {
    return (
      <div className={styles.novoCartaoEscolha}>
        <select
          className={styles.selectCartao}
          value=""
          onChange={(e) => {
            const uuid = e.target.value;
            if (!uuid) return;
            onAtualizarLinha(linhaId, {
              tipo: 'cartao_salvo',
              cartaoSalvoUuid: uuid,
            });
          }}
          data-cy="checkout-split-pick-saved-on-new-line"
          aria-label="Usar outro cartão cadastrado"
        >
          <option value="">Usar outro cartão cadastrado</option>
          {disponiveis.map((c) => (
            <option key={c.uuid} value={c.uuid}>
              {cartaoSalvoLabel(c.uuid)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onAbrirModalCartao(linhaId)}
          data-cy="checkout-split-inform-new-card"
        >
          Informar cartão novo
        </button>
      </div>
    );
  }
  
  return (
    <button
      type="button"
      className="btn-primary"
      onClick={() => onAbrirModalCartao(linhaId)}
      data-cy="checkout-add-card-button"
    >
      Informar cartão
    </button>
  );
};
