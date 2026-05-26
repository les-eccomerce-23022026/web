import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './style.module.css';
import { ROTAS } from '@/config/rotas';

/**
 * RF0037: Após finalização, status EM PROCESSAMENTO.
 * RN0038: Sucesso → APROVADA (simulado como EM PROCESSAMENTO até admin aprovar).
 */
export const PedidoConfirmado = () => {
  const searchParams = useSearchParams();
  const pedidoUuid = searchParams.get('pedido');
  const [dataAtual, setDataAtual] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDataAtual(new Date().toLocaleDateString('pt-BR'));
    }
  }, []);

  return (
    <div className={styles['confirmado-page']}>
      <div className={`card ${styles['confirmado-card']}`}>
        <span className={styles['confirmado-icon']}>✅</span>
        <h1>Pedido Realizado com Sucesso!</h1>
        <h2>Seu pagamento foi processado e seu pedido já está em andamento.</h2>

        <div className={styles['confirmado-status-badge']}>
          Status: EM PROCESSAMENTO
        </div>

        <div className={styles['confirmado-info']}>
          <p><strong>Número do Pedido:</strong> {pedidoUuid}</p>
          <p><strong>Data:</strong> {dataAtual}</p>
          <p><strong>Status Atual:</strong> EM PROCESSAMENTO</p>
          <p>
            Você receberá atualizações sobre o status do seu pedido.
            Acompanhe a entrega pela página &quot;Meus Pedidos&quot;.
          </p>
        </div>

        <div className={styles['confirmado-actions']}>
          <Link href={ROTAS.HOME}>
            <button className={`btn-primary ${styles['confirmado-btn-home']}`} data-cy="confirmado-btn-home">
              Voltar à Loja
            </button>
          </Link>
          <Link href={ROTAS.PEDIDOS}>
            <button className={`btn-secondary ${styles['confirmado-btn-pedidos']}`} data-cy="confirmado-btn-pedidos">
              Ver Meus Pedidos
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
