import styles from './Checkout.module.css';

type Props = {
  totalMenosParcial: number;
  finalizando: boolean;
  enderecoOk: boolean;
  freteSelecionado: boolean;
  temFormaPagamento: boolean;
  onFinalizar: () => void;
};

const podeFinalizar = (
  finalizando: boolean,
  enderecoOk: boolean,
  freteSelecionado: boolean,
  temFormaPagamento: boolean,
): boolean =>
  !finalizando && enderecoOk && freteSelecionado && temFormaPagamento;

export const CheckoutResumoPedidoAcoes = ({
  totalMenosParcial,
  finalizando,
  enderecoOk,
  freteSelecionado,
  temFormaPagamento,
  onFinalizar,
}: Props) => {
  const disabled = !podeFinalizar(
    finalizando,
    enderecoOk,
    freteSelecionado,
    temFormaPagamento,
  );

  return (
    <>
      <hr className={styles['checkout-summary-divider']} />

      <div className={styles['checkout-total-row']}>
        <span className={styles['checkout-total-label']}>Total a Pagar:</span>
        <span className={styles['checkout-total-value']}>
          R$ {totalMenosParcial.toFixed(2).replace('.', ',')}
        </span>
      </div>

      <button
        className={`btn-primary ${styles['checkout-btn-finish']}`}
        onClick={onFinalizar}
        disabled={disabled}
        data-cy="checkout-finish-button"
      >
        {finalizando ? 'Processando...' : 'Concluir Pedido'}
      </button>

      {enderecoOk && freteSelecionado && (
        <p className={styles['checkout-entrega-info']}>✓ Entrega e frete configurados</p>
      )}

      {temFormaPagamento && (
        <p className={styles['checkout-pagamento-info']}>✓ Pagamento pronto para processamento</p>
      )}
    </>
  );
};
