import type { ICupomDisponivel } from '@/interfaces/pagamento';
import { formatarValorSugestaoCupom } from './cupomInputUtils';
import styles from './CupomInput.style.module.css';

type Props = {
  mostrarSugestoes: boolean;
  cuponsNaoAplicados: ICupomDisponivel[];
  onSelecionarSugestao: (cupom: ICupomDisponivel) => void;
};

export const CupomSugestoesLista = ({
  mostrarSugestoes,
  cuponsNaoAplicados,
  onSelecionarSugestao,
}: Props) => {
  if (!mostrarSugestoes) {
    return null;
  }

  if (cuponsNaoAplicados.length === 0) {
    return null;
  }

  return (
    <div className={styles['cupom-sugestoes']} data-cy="checkout-coupon-suggestions">
      <p className={styles['sugestoes-titulo']}>Cupons disponíveis:</p>
      {cuponsNaoAplicados.map((cupom) => (
        <button
          key={cupom.uuid}
          type="button"
          className={styles['sugestao-item']}
          onClick={() => onSelecionarSugestao(cupom)}
          data-cy={`checkout-coupon-suggestion-${cupom.codigo}`}
        >
          <span className={styles['sugestao-codigo']}>{cupom.codigo}</span>
          <span className={styles['sugestao-valor']}>{formatarValorSugestaoCupom(cupom)}</span>
        </button>
      ))}
    </div>
  );
};
