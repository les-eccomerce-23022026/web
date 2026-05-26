import { formatarValorBrl } from './checkoutSplitPagamentoUtils';
import styles from './CheckoutSplitPagamento.style.module.css';

type Props = {
  totalAposCupons: number;
  alinhado: boolean;
  restante: number;
  percentualCoberto: number;
};

export const CheckoutSplitResumoCobertura = ({
  totalAposCupons,
  alinhado,
  restante,
  percentualCoberto,
}: Props) => {
  const percentualArredondado = Math.round(percentualCoberto);
  const percentualNormalizado = Math.max(0, Math.min(100, percentualCoberto));

  return (
    <div className={styles.coverageWrap}>
      <div
        className={`${styles.coverageTrack} ${alinhado ? styles.coverageTrackDone : ''}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentualArredondado}
        aria-label={
          alinhado
            ? 'Cobertura do total: completa'
            : `Cobertura do total: ${percentualArredondado} por cento`
        }
      >
        <meter
          className={`${styles.coverageMeter} ${alinhado ? styles.coverageFillDone : ''}`}
          min={0}
          max={100}
          value={percentualNormalizado}
          aria-hidden="true"
        />
      </div>
      <p className={alinhado ? styles.coverageCaptionOk : styles.coverageCaptionWarn}>
        {totalAposCupons <= 0.02 ? (
          'Tudo pronto!'
        ) : alinhado ? (
          'Tudo pronto!'
        ) : restante > 0.02 ? (
          <>
            Faltam <strong>R$ {formatarValorBrl(restante)}</strong> para cobrir o total
          </>
        ) : (
          <>
            Soma acima do total em <strong>R$ {formatarValorBrl(Math.abs(restante))}</strong> — ajuste as linhas
          </>
        )}
      </p>
    </div>
  );
};
