import styles from './PagamentoParcialInput.style.module.css';

interface PagamentoParcialHeaderProps {
  valorTotal: number;
  valorJaPago: number;
  valorRestante: number;
}

export const PagamentoParcialHeader = ({
  valorTotal,
  valorJaPago,
  valorRestante
}: PagamentoParcialHeaderProps) => {
  const formatarValor = (valor: number) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className={styles['pagamento-parcial-header']}>
      <h4>Pagamento Parcial com Múltiplos Cartões</h4>
      <div className={styles['valores-resumo']}>
        <span>Valor total: <strong>R$ {formatarValor(valorTotal)}</strong></span>
        <span>Já pago: <strong className={styles['pago']}>R$ {formatarValor(valorJaPago)}</strong></span>
        <span className={valorRestante > 0 ? styles['restante'] : ''}>
          Restante: <strong>R$ {formatarValor(valorRestante)}</strong>
        </span>
      </div>
    </div>
  );
};
