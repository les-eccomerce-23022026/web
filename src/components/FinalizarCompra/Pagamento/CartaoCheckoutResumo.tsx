import { Check } from 'lucide-react';
import styles from './CartaoCheckoutResumo.module.css';

type Props = {
  bandeira: string;
  ultimosDigitos: string;
  nomeTitular?: string;
  onTrocar: () => void;
};

export const CartaoCheckoutResumo = ({ bandeira, ultimosDigitos, nomeTitular, onTrocar }: Props) => {
  return (
    <div className={styles.wrap} data-cy="checkout-novo-cartao-resumo">
      <div className={styles.cardVisual} role="group" aria-label={`Cartão ${bandeira} final ${ultimosDigitos}`}>
        <div className={styles.main}>
          <span className={styles.badge}>{bandeira}</span>
          <span className={styles.pan}>•••• {ultimosDigitos}</span>
          {nomeTitular ? <p className={styles.titular}>{nomeTitular}</p> : null}
        </div>
        <div className={styles.check} aria-hidden>
          <Check size={22} strokeWidth={2.5} />
        </div>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.trocarBtn}
          onClick={onTrocar}
          data-cy="checkout-trocar-cartao-button"
          aria-label="Trocar cartão: abrir formulário para informar outro cartão"
        >
          Trocar cartão
        </button>
      </div>
    </div>
  );
};
