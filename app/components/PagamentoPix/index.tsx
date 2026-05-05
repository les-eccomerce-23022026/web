'use client';

import { Suspense } from 'react';
import { usePagamentoPixModel } from '@/pages-react-router/Vendas/PagamentoPix/usePagamentoPixModel';
import { PagamentoPixFalha } from '@/pages-react-router/Vendas/PagamentoPix/PagamentoPixFalha';
import { PagamentoPixPagarView } from '@/pages-react-router/Vendas/PagamentoPix/PagamentoPixPagarView';
import styles from '@/pages-react-router/Vendas/PagamentoPix/style.module.css';

const PagamentoPixConteudo = () => {
  const model = usePagamentoPixModel();

  if (model.phase === 'invalid') {
    return (
      <div className={styles.wrap}>
        <p className={styles.erro} role="alert">
          {model.erro}
        </p>
        <button type="button" className="btn-primary" onClick={() => model.navigate('/checkout')}>
          Voltar ao checkout
        </button>
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
