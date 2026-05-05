import styles from './CartaoCreditoForm.style.module.css';

type Props = {
  onCancel?: () => void;
};

export const CartaoCreditoFormAcoes = ({ onCancel }: Props) => {
  return (
    <div className={styles['form-actions']}>
      {onCancel ? (
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          data-cy="checkout-card-cancel-button"
        >
          Cancelar
        </button>
      ) : null}
      <button type="submit" className="btn-primary" data-cy="checkout-card-submit-button">
        Adicionar Cartão
      </button>
    </div>
  );
};
