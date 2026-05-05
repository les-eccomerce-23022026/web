import styles from './PagamentoParcialInput.style.module.css';

interface PagamentoCompletoProps {
  valorTotal: number;
}

export const PagamentoCompleto = ({ valorTotal }: PagamentoCompletoProps) => {
  const formatarValor = (valor: number) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className={styles['pagamento-completo']}>
      <p className={styles['sucesso']}>
        ✓ Pagamento completo! Total de R$ {formatarValor(valorTotal)} coberto.
      </p>
    </div>
  );
};
