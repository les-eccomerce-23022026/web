'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/pages-react-router/Vendas/PedidoConfirmado/style.module.css';

const PedidoConfirmadoConteudo = () => {
  const searchParams = useSearchParams();
  const pedidoUuid = searchParams.get('pedido');

  return (
    <div className={styles['confirmado-page']}>
      <div className={`card ${styles['confirmado-card']}`}>
        <span className={styles['confirmado-icon']}>✅</span>
        <h1>Pedido Realizado com Sucesso!</h1>
        <h2>Seu pagamento foi processado e seu pedido ja esta em andamento.</h2>

        <div className={styles['confirmado-status-badge']}>
          Status: EM PROCESSAMENTO
        </div>

        <div className={styles['confirmado-info']}>
          <p><strong>Numero do Pedido:</strong> {pedidoUuid}</p>
          <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
          <p><strong>Status Atual:</strong> EM PROCESSAMENTO</p>
          <p>
            Voce recebera atualizacoes sobre o status do seu pedido.
            Acompanhe a entrega pela pagina &quot;Meus Pedidos&quot;.
          </p>
        </div>

        <div className={styles['confirmado-actions']}>
          <Link href="/">
            <button className={`btn-primary ${styles['confirmado-btn-home']}`} data-cy="confirmado-btn-home">
              Voltar a Loja
            </button>
          </Link>
          <Link href="/pedidos">
            <button className={`btn-secondary ${styles['confirmado-btn-pedidos']}`} data-cy="confirmado-btn-pedidos">
              Ver Meus Pedidos
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const PedidoConfirmado = () => {
  return (
    <Suspense fallback={<div className={styles['confirmado-page']}><div className={`card ${styles['confirmado-card']}`}><p>Carregando...</p></div></div>}>
      <PedidoConfirmadoConteudo />
    </Suspense>
  );
};
