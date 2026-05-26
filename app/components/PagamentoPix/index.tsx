'use client';

import { Suspense } from 'react';
import { AlertTriangle } from 'lucide-react';
import { usePagamentoPixModel } from '@/pages-react-router/Vendas/PagamentoPix/usePagamentoPixModel';
import { PagamentoPixFalha } from '@/pages-react-router/Vendas/PagamentoPix/PagamentoPixFalha';
import { PagamentoPixPagarView } from '@/pages-react-router/Vendas/PagamentoPix/PagamentoPixPagarView';
import styles from '@/pages-react-router/Vendas/PagamentoPix/style.module.css';

const PagamentoPixConteudo = () => {
  const model = usePagamentoPixModel();

  if (model.phase === 'invalid') {
    return (
      <div className={styles.wrap}>
        <div className={styles.erroCard} role="alert">
          <div className={styles.erroIcon}>
            <AlertTriangle size={48} strokeWidth={1.5} />
          </div>
          <h2 className={styles.erroTitle}>Sessão de pagamento inválida</h2>
          <p className={styles.erroMessage}>
            {model.erro}
          </p>
          <p className={styles.erroContext}>
            A sessão de pagamento pode ter expirado após 15 minutos de inatividade. Inicie um novo checkout para concluir sua compra.
          </p>
          <div className={styles.erroActions}>
            <button type="button" className="btn-primary" onClick={() => model.navigate('/checkout')}>
              Voltar ao checkout
            </button>
            <button type="button" className="btn-secondary" onClick={() => model.navigate('/pedidos')}>
              Ver Meus Pedidos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (model.phase === 'loading' || !model.payload) {
    return (
      <div className={styles.wrap}>
        <p className={styles.loadingText}>Carregando cobrança PIX...</p>
      </div>
    );
  }

  if (model.phase === 'falha') {
    return (
      <div className={styles.wrap} data-cy="pagamento-pix-page">
        <PagamentoPixFalha erroExtra={model.erro} onCheckout={() => model.navigate('/checkout')} />
      </div>
    );
  }

  return (
    <PagamentoPixPagarView
      payload={model.payload}
      erro={model.erro}
      copiadoIdx={model.copiadoIdx}
      simulando={model.simulando}
      nowMs={model.nowMs}
      expiraMsPorLinha={model.expiraMsPorLinha}
      algumPrazoClienteExpirou={model.algumPrazoClienteExpirou}
      aguardandoBackendAinda={model.aguardandoBackendAinda}
      onCopiar={model.copiar}
      onSimularWebhook={model.simularWebhook}
    />
  );
};

export const PagamentoPix = () => {
  return (
    <Suspense fallback={<div className={styles.wrap}><p className={styles.loadingText}>Carregando...</p></div>}>
      <PagamentoPixConteudo />
    </Suspense>
  );
};
