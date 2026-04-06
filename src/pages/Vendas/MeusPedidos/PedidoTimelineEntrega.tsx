import type { StatusPedido } from '@/interfaces/pedido';
import { statusParaEtapaConcluida } from './pedidoEntregaEtapas';
import styles from './PedidoTimelineEntrega.module.css';

const LABELS = ['Pedido realizado', 'Preparando', 'Em trânsito', 'Entregue'];

function ariaLabel(etapa: number | 'cancelado'): string {
  if (etapa === 'cancelado') return 'Pedido cancelado. Entrega não aplicável.';
  const nomes = ['', 'pedido realizado', 'preparando', 'em trânsito', 'entregue'];
  return `Entrega: etapa ${etapa} de 4, ${nomes[etapa]}`;
}

export function PedidoTimelineEntrega({ status }: { status: StatusPedido }) {
  const etapa = statusParaEtapaConcluida(status);

  if (etapa === 'cancelado') {
    return (
      <div
        className={styles.cancelledWrap}
        role="status"
        aria-label="Pedido cancelado"
      >
        <p className={styles.cancelledText}>Pedido cancelado — acompanhe o status acima.</p>
        <div className={styles.trackMuted} aria-hidden>
          <span className={styles.dotMuted} />
          <span className={styles.lineMuted} />
          <span className={styles.dotMuted} />
          <span className={styles.lineMuted} />
          <span className={styles.dotMuted} />
          <span className={styles.lineMuted} />
          <span className={styles.dotMuted} />
        </div>
        <div className={styles.labels}>
          {LABELS.map((label) => (
            <span key={label} className={styles.labelMuted}>
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const completed = etapa;

  return (
    <div className={styles.wrap} role="group" aria-label={ariaLabel(etapa)}>
      <div className={styles.track} aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={styles.nodeGroup}>
            <span
              className={completed >= i + 1 ? styles.dotFilled : styles.dotEmpty}
            />
            {i < 3 && (
              <span
                className={
                  completed > i + 1 ? styles.lineGreen : styles.lineGrey
                }
              />
            )}
          </div>
        ))}
      </div>
      <div className={styles.labels}>
        {LABELS.map((label, i) => (
          <span
            key={label}
            className={
              completed >= i + 1 ? styles.labelActive : styles.labelInactive
            }
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
