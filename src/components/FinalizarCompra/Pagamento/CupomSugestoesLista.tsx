import type { ICupomDisponivel } from '@/interfaces/pagamento';
import { formatarValorSugestaoCupom } from './cupomInputUtils';
import styles from './CupomInput.style.module.css';

type Props = {
  mostrarSugestoes: boolean;
  cuponsNaoAplicados: ICupomDisponivel[];
  subtotalAtual?: number;
  onSelecionarSugestao: (cupom: ICupomDisponivel) => void;
};

export const CupomSugestoesLista = ({
  mostrarSugestoes,
  cuponsNaoAplicados,
  subtotalAtual,
  onSelecionarSugestao,
}: Props) => {
  if (!mostrarSugestoes || cuponsNaoAplicados.length === 0) {
    return null;
  }

  return (
    <div className={styles['cupom-sugestoes']} data-cy="checkout-coupon-suggestions">
      <p className={styles['sugestoes-titulo']}>Cupons disponíveis:</p>
      {cuponsNaoAplicados.map((cupom) => {
        const valorMinimo = cupom.valorMinimo ?? 0;
        const inelegivel =
          valorMinimo > 0 && subtotalAtual !== undefined && subtotalAtual < valorMinimo;
        return (
          <button
            key={cupom.uuid}
            type="button"
            className={styles['sugestao-item']}
            onClick={() => !inelegivel && onSelecionarSugestao(cupom)}
            disabled={inelegivel}
            title={
              inelegivel
                ? `Mínimo de R$ ${valorMinimo.toFixed(2).replace('.', ',')} para usar este cupom`
                : undefined
            }
            data-cy={`checkout-coupon-suggestion-${cupom.codigo}`}
          >
            <span className={styles['sugestao-codigo']}>{cupom.codigo}</span>
            <span className={styles['sugestao-valor']}>{formatarValorSugestaoCupom(cupom)}</span>
            {inelegivel && (
              <span className={styles['sugestao-minimo']}>
                Mínimo R$ {valorMinimo.toFixed(2).replace('.', ',')}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
