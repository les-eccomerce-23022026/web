import { Check, Copy } from 'lucide-react';
import type { PixPendenteInfo } from '@/utils/finalizarCompraLiquidacaoPagamentos';
import { formatPixCountdown } from './pagamentoPixUtils';
import styles from './PagamentoPix.module.css';

type Props = {
  pix: PixPendenteInfo;
  idx: number;
  totalLinhas: number;
  expiraMs: number;
  nowMs: number;
  copiadoIdx: number | null;
  onCopiar: (texto: string, idx: number) => void;
};

export const PagamentoPixCobrancaCard = ({
  pix,
  idx,
  totalLinhas,
  expiraMs,
  nowMs,
  copiadoIdx,
  onCopiar,
}: Props) => {
  const countdown = formatPixCountdown(expiraMs, nowMs);
  const expiradoLinha = nowMs > expiraMs;

  return (
    <section className={`card ${styles.cobrancaCard}`} data-cy={`pagamento-pix-linha-${idx}`}>
      <div className={styles.cobrancaHeader}>
        <h2 className={styles.cobrancaTitulo}>
          {totalLinhas > 1 ? `Cobrança ${idx + 1}` : 'Cobrança PIX'}
        </h2>
        <span className={styles.valorChip}>R$ {pix.valor.toFixed(2).replace('.', ',')}</span>
      </div>

      <div className={styles.gridQrCopy}>
        {pix.qrCodeBase64 ? (
          <div className={styles.qrCol}>
            <div className={styles.qrFrame}>
              <img
                src={`data:image/png;base64,${pix.qrCodeBase64}`}
                alt="QR Code para pagamento PIX"
                width={200}
                height={200}
                className={styles.qrImg}
              />
            </div>
          </div>
        ) : null}

        <div className={styles.copyCol}>
          <label className={styles.label} htmlFor={`pix-copy-${idx}`}>
            Código PIX (copia e cola)
          </label>
          <textarea
            id={`pix-copy-${idx}`}
            readOnly
            className={styles.textarea}
            value={pix.copiaCola}
            rows={4}
            spellCheck={false}
          />
          <button
            type="button"
            className={`btn-primary ${styles.copyBtn}`}
            onClick={() => void onCopiar(pix.copiaCola, idx)}
            data-cy={`pagamento-pix-copy-${idx}`}
          >
            {copiadoIdx === idx ? (
              <>
                <Check size={18} aria-hidden />
                Copiado
              </>
            ) : (
              <>
                <Copy size={18} aria-hidden />
                Copiar código
              </>
            )}
          </button>
          <p className={styles.liveRegion} aria-live="polite">
            {copiadoIdx === idx ? 'Código copiado para a área de transferência.' : '\u00a0'}
          </p>
        </div>
      </div>

      <p className={styles.expira}>
        <span className={expiradoLinha ? styles.expiraAlert : undefined}>
          {expiradoLinha ? 'Prazo no app: ' : 'Expira em: '}
          {new Date(expiraMs).toLocaleString('pt-BR')}
        </span>
        {' · '}
        <span className={styles.countdown}>Restante: {countdown}</span>
      </p>
    </section>
  );
};
