import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ICartaoSalvoPagamento, IPagamentoParcial } from '@/interfaces/pagamento';
import styles from './PagamentoParcialInput.module.css';

type ParcelaComNome = IPagamentoParcial & { nomeCartao?: string };

interface PagamentoParcialInputProps {
  cartoesSalvos: ICartaoSalvoPagamento[];
  valorTotal: number;
  valorJaPago: number;
  onAdicionar: (referenciaMeioPagamento: string, valor: number) => boolean;
  onRemover: (index: number) => void;
  parcelasLiquidacao: ParcelaComNome[];
}

export const PagamentoParcialInput = ({
  cartoesSalvos,
  valorTotal,
  valorJaPago,
  onAdicionar,
  onRemover,
  parcelasLiquidacao
}: PagamentoParcialInputProps) => {
  const [cartaoSelecionado, setCartaoSelecionado] = useState('');
  const [valorParcial, setValorParcial] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const valorRestante = valorTotal - valorJaPago;
  const valorMinimo = 10;

  const handleAdicionar = () => {
    setErro(null);

    if (!cartaoSelecionado) {
      setErro('Selecione um cartão');
      return;
    }

    const valorNumerico = parseFloat(valorParcial.replace(',', '.'));

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setErro('Digite um valor válido');
      return;
    }

    if (valorNumerico < valorMinimo) {
      setErro(`Valor mínimo por cartão é R$ ${valorMinimo.toFixed(2).replace('.', ',')}`);
      return;
    }

    if (valorNumerico > valorRestante) {
      setErro(`Valor não pode exceder o restante de R$ ${valorRestante.toFixed(2).replace('.', ',')}`);
      return;
    }

    const sucesso = onAdicionar(cartaoSelecionado, valorNumerico);
    
    if (sucesso) {
      setCartaoSelecionado('');
      setValorParcial('');
    }
  };

  const cartaoSelecionadoInfo = cartoesSalvos.find(c => c.uuid === cartaoSelecionado);

  return (
    <div className={styles['pagamento-parcial-container']} data-cy="checkout-partial-payment">
      <div className={styles['pagamento-parcial-header']}>
        <h4>Pagamento Parcial com Múltiplos Cartões</h4>
        <div className={styles['valores-resumo']}>
          <span>Valor total: <strong>R$ {valorTotal.toFixed(2).replace('.', ',')}</strong></span>
          <span>Já pago: <strong className={styles['pago']}>R$ {valorJaPago.toFixed(2).replace('.', ',')}</strong></span>
          <span className={valorRestante > 0 ? styles['restante'] : ''}>
            Restante: <strong>R$ {valorRestante.toFixed(2).replace('.', ',')}</strong>
          </span>
        </div>
      </div>

      {/* Pagamentos já adicionados */}
      {parcelasLiquidacao.length > 0 && (
        <div className={styles['pagamentos-adicionados']} data-cy="checkout-partial-payments-list">
          {parcelasLiquidacao.map((pagamento, index) => (
            <div
              key={index}
              className={styles['pagamento-item']}
              data-cy={`checkout-partial-payment-${index}`}
            >
              <div className={styles['pagamento-info']}>
                <span className={styles['cartao-nome']}>
                  {pagamento.nomeCartao || `Cartão ${pagamento.referenciaMeioPagamento.slice(0, 8)}...`}
                </span>
                <span className={styles['pagamento-valor']}>
                  R$ {pagamento.valor.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <button
                type="button"
                className={styles['remover-pagamento']}
                onClick={() => onRemover(index)}
                data-cy={`checkout-partial-payment-remove-${index}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Adicionar novo pagamento parcial */}
      {valorRestante > 0 && (
        <div className={styles['adicionar-pagamento']}>
          <div className={styles['form-row']}>
            <select
              value={cartaoSelecionado}
              onChange={(e) => setCartaoSelecionado(e.target.value)}
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
              onChange={(e) => setValorParcial(e.target.value)}
              placeholder={`R$ ${valorRestante.toFixed(2).replace('.', ',')}`}
              step="0.01"
              min={valorMinimo}
              max={valorRestante}
              className={styles['input-valor']}
              data-cy="checkout-partial-value-input"
            />

            <button
              type="button"
              className="btn-secondary"
              onClick={handleAdicionar}
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
            * Valor mínimo por cartão: R$ {valorMinimo.toFixed(2).replace('.', ',')}
          </p>
        </div>
      )}

      {valorRestante <= 0 && (
        <div className={styles['pagamento-completo']}>
          <p className={styles['sucesso']}>
            ✓ Pagamento completo! Total de R$ {valorTotal.toFixed(2).replace('.', ',')} coberto.
          </p>
        </div>
      )}
    </div>
  );
}
