import { useSearchParams, Link } from 'react-router-dom';
import styles from './PedidoConfirmado.module.css';

/**
 * RF0037: Após finalização, status EM PROCESSAMENTO.
 * RN0038: Sucesso → APROVADA (simulado como EM PROCESSAMENTO até admin aprovar).
 */
export const PedidoConfirmado = () => {
  const [searchParams] = useSearchParams();
  const pedidoUuid = searchParams.get('pedido');

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
          <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
          <p><strong>Status Atual:</strong> EM PROCESSAMENTO</p>
          <p>
            Você receberá atualizações sobre o status do seu pedido.
            Acompanhe a entrega pela página &quot;Meus Pedidos&quot;.
          </p>
        </div>

        <div className={styles['confirmado-actions']}>
          <Link to="/">
            <button className={`btn-primary ${styles['confirmado-btn-home']}`} data-cy="confirmado-btn-home">
              Voltar à Loja
            </button>
          </Link>
          <Link to="/pedidos">
            <button className={`btn-secondary ${styles['confirmado-btn-pedidos']}`} data-cy="confirmado-btn-pedidos">
              Ver Meus Pedidos
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
