import { Link } from 'react-router-dom';
import styles from './PagamentoPix.module.css';

type Props = {
  erroExtra: string | null;
  onCheckout: () => void;
};

export const PagamentoPixFalha = ({ erroExtra, onCheckout }: Props) => (
  <>
    <header className={styles.pageHeader}>
      <h1 className={styles.title}>Pagamento não concluído</h1>
      <p className={styles.lead}>
        O pagamento PIX não foi confirmado a tempo ou foi recusado. O pedido aparece como cancelado em
        Meus pedidos. Você pode iniciar uma nova compra quando quiser.
      </p>
    </header>
    <div className={`card ${styles.falhaCard}`} role="alert">
      <p className={styles.falhaTexto}>
        Se a cobrança tinha expirado, o banco não liquida o PIX. Em ambiente de teste, isso também
        ocorre ao simular o webhook após o prazo.
      </p>
      <div className={styles.falhaActions}>
        <Link to="/pedidos">
          <button type="button" className={`btn-primary ${styles.falhaBtn}`}>
            Ver Meus pedidos
          </button>
        </Link>
        <button type="button" className="btn-secondary" onClick={onCheckout}>
          Novo checkout
        </button>
      </div>
    </div>
    {erroExtra ? (
      <p className={styles.erro} role="alert">
        {erroExtra}
      </p>
    ) : null}
  </>
);
