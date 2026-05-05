import styles from './CartaoCreditoForm.style.module.css';

type Props = {
  erros: string[];
};

export const CartaoCreditoFormErros = ({ erros }: Props) => {
  if (erros.length === 0) {
    return null;
  }

  return (
    <div className={styles['cartao-form-errors']} data-cy="checkout-card-errors">
      {erros.map((erro, index) => (
        <p key={index} className={styles['error-message']}>
          {erro}
        </p>
      ))}
    </div>
  );
};
