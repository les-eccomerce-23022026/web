import { Plus } from 'lucide-react';
import type { ICartaoSalvoPagamento } from '@/interfaces/pagamento';
import styles from './PagamentoParcialInput.style.module.css';

interface AdicionarPagamentoFormProps {
  cartoesSalvos: ICartaoSalvoPagamento[];
  cartaoSelecionado: string;
  valorParcial: string;
  valorRestante: number;
  valorMinimo: number;
  erro: string | null;
  onCartaoChange: (value: string) => void;
  onValorChange: (value: string) => void;
  onAdicionar: () => void;
}

export const AdicionarPagamentoForm = ({
  cartoesSalvos,
  cartaoSelecionado,
  valorParcial,
  valorRestante,
  valorMinimo,
  erro,
  onCartaoChange,
  onValorChange,
  onAdicionar
}: AdicionarPagamentoFormProps) => {
  const formatarValor = (valor: number) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cartaoSelecionadoInfo = cartoesSalvos.find(c => c.uuid === cartaoSelecionado);

  return (
    <div className={styles['adicionar-pagamento']}>
      <div className={styles['form-row']}>
        <select
          value={cartaoSelecionado}
          onChange={(e) => onCartaoChange(e.target.value)}
          className={styles['select-cartao']}
          data-cy="checkout-partial-card-select"
        >
          <option value="">Selecionar Cartão</option>
          {cartoesSalvos.map((cartao) => (
            <option key={cartao.uuid} value={cartao.uuid}>
              {cartao.bandeira} •••• {cartao.ultimosDigitosCartao} - {cartao.nomeCliente}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={valorParcial}
          onChange={(e) => onValorChange(e.target.value)}
          placeholder={`R$ ${formatarValor(valorRestante)}`}
          step="0.01"
          min={valorMinimo}
          max={valorRestante}
          className={styles['input-valor']}
          data-cy="checkout-partial-value-input"
        />

        <button
          type="button"
          className="btn-secondary"
          onClick={onAdicionar}
          data-cy="checkout-add-partial-payment-button"
        >
          <Plus size={18} />
          Adicionar
        </button>
      </div>

      {cartaoSelecionadoInfo && (
        <p className={styles['cartao-info']}>
          Cartão selecionado: {cartaoSelecionadoInfo.bandeira} · últimos dígitos {cartaoSelecionadoInfo.ultimosDigitosCartao}
        </p>
      )}

      {erro && (
        <p className={styles['erro']} data-cy="checkout-partial-payment-error">
          {erro}
        </p>
      )}

      <p className={styles['observacao']}>
        * Valor mínimo por cartão: R$ {formatarValor(valorMinimo)}
      </p>
    </div>
  );
};
