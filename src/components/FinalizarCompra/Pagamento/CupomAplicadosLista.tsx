import { X } from 'lucide-react';
import type { ICupomAplicado } from '@/interfaces/pagamento';
import { formatarValorCupom } from './cupomInputUtils';
import styles from './CupomInput.style.module.css';

type Props = {
  cuponsAplicados: ICupomAplicado[];
  onRemover: (cupomUuid: string) => void;
};

export const CupomAplicadosLista = ({ cuponsAplicados, onRemover }: Props) => {
  if (cuponsAplicados.length === 0) {
    return null;
  }

  return (
    <div className={styles['cupons-aplicados']} data-cy="checkout-applied-coupons">
      {cuponsAplicados.map((cupom) => (
        <div
          key={cupom.uuid}
          className={styles['cupom-aplicado']}
          data-cy={`checkout-coupon-${cupom.codigo}`}
        >
          <div className={styles['cupom-info']}>
            <span className={styles['cupom-codigo']}>{cupom.codigo}</span>
            <span className={styles['cupom-tipo']}>
              {cupom.tipo === 'promocional' ? 'Promocional' : 'Troca'}
            </span>
            <span className={styles['cupom-valor']}>{formatarValorCupom(cupom)}</span>
          </div>
          <button
            className={styles['remover-cupom']}
            onClick={() => onRemover(cupom.uuid)}
            data-cy={`checkout-coupon-remove-${cupom.codigo}`}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
