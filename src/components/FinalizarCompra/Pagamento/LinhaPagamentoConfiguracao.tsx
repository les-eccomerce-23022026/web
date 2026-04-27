import { AlertCircle } from 'lucide-react';
import type { LinhaPagamentoCheckout } from '@/types/checkout';
import type { IPoliticaParcelamentoCartao } from '@/interfaces/pagamento';
import { opcoesParcelamentoCartaoParaValor } from '@/utils/opcoesParcelamentoCartao';
import styles from './CheckoutSplitPagamento.module.css';

type Props = {
  linha: LinhaPagamentoCheckout;
  politicaParcelamento: IPoliticaParcelamentoCartao;
  abaixoMin: boolean;
  onAtualizarLinha: (id: string, patch: Partial<LinhaPagamentoCheckout>) => void;
};

export const LinhaPagamentoConfiguracao = ({
  linha,
  politicaParcelamento,
  abaixoMin,
  onAtualizarLinha,
}: Props) => {
  const isCartao = linha.tipo === 'cartao_salvo' || linha.tipo === 'cartao_novo';

  return (
    <>
      {isCartao ? (
        <div className={styles.valorRow}>
          <label htmlFor={`parcelas-linha-${linha.id}`}>Parcelas no cartão</label>
          <select
            id={`parcelas-linha-${linha.id}`}
            className={styles.selectCartao}
            value={linha.parcelasCartao ?? 1}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              onAtualizarLinha(linha.id, {
                parcelasCartao: Number.isFinite(n) ? n : 1,
              });
            }}
            data-cy="checkout-split-line-parcelas"
          >
            {opcoesParcelamentoCartaoParaValor(
              Number.isFinite(linha.valor) ? linha.valor : 0,
              politicaParcelamento,
            ).map((op) => (
              <option key={op.quantidadeParcelas} value={op.quantidadeParcelas}>
                {op.rotuloSelect}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className={styles.valorRow}>
        <label htmlFor={`valor-linha-${linha.id}`}>Valor (R$)</label>
        <div className={styles.valorInputWrap}>
          <input
            id={`valor-linha-${linha.id}`}
            type="number"
            min={0}
            step="0.01"
            className={`${styles.valorInput} ${abaixoMin ? styles.valorInputErro : ''}`}
            value={Number.isFinite(linha.valor) ? linha.valor : 0}
            onChange={(e) => {
              const v = parseFloat(e.target.value.replace(',', '.'));
              onAtualizarLinha(linha.id, { valor: Number.isFinite(v) ? v : 0 });
            }}
            data-cy="checkout-split-line-value"
            aria-invalid={abaixoMin}
          />
          {abaixoMin ? (
            <span className={styles.valorErroIcon} title="Mínimo R$ 10,00 nesta linha">
              <AlertCircle size={18} aria-hidden />
            </span>
          ) : null}
        </div>
      </div>
    </>
  );
};
