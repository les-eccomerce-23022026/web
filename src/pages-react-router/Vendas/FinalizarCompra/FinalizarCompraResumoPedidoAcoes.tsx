import { useState } from 'react';
import styles from './FinalizarCompra.module.css';

type Props = {
  totalMenosParcial: number;
  finalizando: boolean;
  enderecoOk: boolean;
  freteSelecionado: boolean;
  temFormaPagamento: boolean;
  saldoPagamentoOk: boolean;
  onFinalizar: () => void;
};

const podeFinalizar = (
  finalizando: boolean,
  enderecoOk: boolean,
  freteSelecionado: boolean,
  temFormaPagamento: boolean,
  saldoPagamentoOk: boolean,
): boolean =>
  !finalizando &&
  enderecoOk &&
  freteSelecionado &&
  temFormaPagamento &&
  saldoPagamentoOk;

export const FinalizarCompraResumoPedidoAcoes = ({
  totalMenosParcial,
  finalizando,
  enderecoOk,
  freteSelecionado,
  temFormaPagamento,
  saldoPagamentoOk,
  onFinalizar,
}: Props) => {
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const disabled = !podeFinalizar(
    finalizando,
    enderecoOk,
    freteSelecionado,
    temFormaPagamento,
    saldoPagamentoOk,
  );

  const coberto = saldoPagamentoOk;

  return (
    <>
      <hr className={styles['checkout-summary-divider']} />

      <div className={styles['checkout-total-row']}>
        <span
          className={
            coberto
              ? `${styles['checkout-total-label']} ${styles['checkout-total-label-coberto']}`
              : `${styles['checkout-total-label']} ${styles['checkout-total-label-saldo']}`
          }
        >
          {coberto ? 'Coberto' : 'Saldo a definir'}
        </span>
        <span
          className={
            coberto
              ? `${styles['checkout-total-value']} ${styles['checkout-total-value-coberto']}`
              : `${styles['checkout-total-value']} ${styles['checkout-total-value-saldo']}`
          }
          data-cy="checkout-total-value"
        >
          R$ {totalMenosParcial.toFixed(2).replace('.', ',')}
        </span>
      </div>

      <button
        className={`btn-primary ${styles['checkout-btn-finish']} ${!disabled ? styles['checkout-btn-finish-ready'] : ''}`}
        onClick={() => {
          setErrorLocal(null);
          if (!enderecoOk) {
            setErrorLocal('Selecione um endereço');
            return;
          }
          if (!freteSelecionado) {
            setErrorLocal('Selecione uma opção de frete');
            return;
          }
          if (!temFormaPagamento || !saldoPagamentoOk) {
            setErrorLocal('Configure a forma de pagamento corretamente');
            return;
          }
          onFinalizar();
        }}
        disabled={disabled}
        data-cy="checkout-finish-button"
      >
        {finalizando ? 'Processando...' : 'Concluir Pedido'}
      </button>

      {errorLocal && (
        <p className={styles['checkout-validation-error']} data-cy="checkout-validation-error">
          {errorLocal}
        </p>
      )}

      {enderecoOk && freteSelecionado && (
        <p className={styles['checkout-entrega-info']}>✓ Entrega e frete configurados</p>
      )}

      {temFormaPagamento && saldoPagamentoOk && (
        <p className={styles['checkout-pagamento-info']}>✓ Pagamento pronto para processamento</p>
      )}

      {temFormaPagamento && !saldoPagamentoOk && (
        <p className={styles['checkout-pagamento-aviso']}>
          Informe cartão ou pagamentos parciais que cubram o total restante.
        </p>
      )}
    </>
  );
};
