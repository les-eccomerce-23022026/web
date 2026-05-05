import { Link } from 'react-router-dom';
import { ShieldCheck, Smartphone } from 'lucide-react';
import type { CheckoutPixPendentePayload } from '@/utils/checkoutPixPendente';
import { PagamentoPixCobrancaCard } from './PagamentoPixCobrancaCard';
import styles from './PagamentoPix.module.css';

type Props = {
  payload: CheckoutPixPendentePayload;
  erro: string | null;
  copiadoIdx: number | null;
  simulando: boolean;
  nowMs: number;
  expiraMsPorLinha: number[];
  algumPrazoClienteExpirou: boolean;
  aguardandoBackendAinda: boolean;
  onCopiar: (texto: string, idx: number) => void;
  onSimularWebhook: () => void;
};

export const PagamentoPixPagarView = ({
  payload,
  erro,
  copiadoIdx,
  simulando,
  nowMs,
  expiraMsPorLinha,
  algumPrazoClienteExpirou,
  aguardandoBackendAinda,
  onCopiar,
  onSimularWebhook,
}: Props) => (
  <div className={styles.wrap} data-cy="pagamento-pix-page">
    <header className={styles.pageHeader}>
      <Link to="/checkout" className={styles.backLink}>
        Voltar ao checkout
      </Link>
      <h1 className={styles.title}>Pagamento via PIX</h1>
      <p className={styles.lead}>
        Escaneie o QR Code com o app do seu banco ou copie o código abaixo. O pedido será confirmado
        automaticamente após a liquidação (neste ambiente, após o webhook de teste).
      </p>
      <div className={styles.trustRow}>
        <span className={styles.trustItem}>
          <ShieldCheck size={18} strokeWidth={2} className={styles.trustIcon} aria-hidden />
          Pagamento instantâneo e seguro
        </span>
        <span className={styles.trustItem}>
          <Smartphone size={18} strokeWidth={2} className={styles.trustIcon} aria-hidden />
          Abra o app do banco para escanear
        </span>
      </div>
    </header>

    {algumPrazoClienteExpirou && aguardandoBackendAinda ? (
      <div className={styles.avisoExpira} role="status" aria-live="polite">
        O prazo desta cobrança PIX no app já passou. Se você não pagou, refaça o checkout. Se o banco
        ainda processar, o pedido pode ser confirmado — acompanhe em Meus pedidos.
      </div>
    ) : null}

    {payload.pixPendentes.map((pix, idx) => (
      <PagamentoPixCobrancaCard
        key={pix.pagamentoUuid}
        pix={pix}
        idx={idx}
        totalLinhas={payload.pixPendentes.length}
        expiraMs={expiraMsPorLinha[idx] ?? new Date(pix.expiraEm).getTime()}
        nowMs={nowMs}
        copiadoIdx={copiadoIdx}
        onCopiar={onCopiar}
      />
    ))}

    <aside className={styles.devPanel} aria-label="Ambiente de testes">
      <p className={styles.devTitle}>Ambiente de testes</p>
      <button
        type="button"
        className={`btn-admin ${styles.devBtn}`}
        onClick={() => void onSimularWebhook()}
        disabled={simulando}
        data-cy="pagamento-pix-simular-webhook"
      >
        {simulando ? 'Confirmando…' : 'Simular pagamento confirmado (webhook)'}
      </button>
      <p className={styles.devHint}>
        Em produção, o banco confirma ao PSP e o PSP chama o webhook do e-commerce. Aqui o botão
        acima dispara o mesmo endpoint de teste.
      </p>
    </aside>

    {erro ? (
      <p className={styles.erro} role="alert">
        {erro}
      </p>
    ) : null}
  </div>
);
