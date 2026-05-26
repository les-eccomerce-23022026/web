import type { IPagamentoParcial } from '@/interfaces/pagamento';
import { PagamentoItem } from './PagamentoItem';
import styles from './PagamentoParcialInput.style.module.css';

type ParcelaComNome = IPagamentoParcial & { nomeCartao?: string };

interface PagamentosAdicionadosListaProps {
  parcelasLiquidacao: ParcelaComNome[];
  onRemover: (index: number) => void;
}

export const PagamentosAdicionadosLista = ({
  parcelasLiquidacao,
  onRemover
}: PagamentosAdicionadosListaProps) => {
  if (parcelasLiquidacao.length === 0) {
    return null;
  }

  return (
    <div className={styles['pagamentos-adicionados']} data-cy="checkout-partial-payments-list">
      {parcelasLiquidacao.map((pagamento, index) => (
        <PagamentoItem
          key={index}
          pagamento={pagamento}
          index={index}
          onRemover={onRemover}
        />
      ))}
    </div>
  );
};
