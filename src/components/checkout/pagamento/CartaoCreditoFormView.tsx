import { Eye, EyeOff, CreditCard } from 'lucide-react';
import type { ChangeEvent } from 'react';
import styles from './CartaoCreditoForm.module.css';

type Props = {
  erros: string[];
  numero: string;
  nomeTitular: string;
  validade: string;
  cvv: string;
  salvar: boolean;
  mostrarCvv: boolean;
  bandeiraDetectada: string | null;
  onNomeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSalvarChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onToggleCvv: () => void;
  onNumeroChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onValidadeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCvvChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCancel?: () => void;
};

const isAmex = (b: string | null) => b === 'American Express';

export const CartaoCreditoFormView = ({
  erros,
  numero,
  nomeTitular,
  validade,
  cvv,
  salvar,
  mostrarCvv,
  bandeiraDetectada,
  onNomeChange,
  onSalvarChange,
  onToggleCvv,
  onNumeroChange,
  onValidadeChange,
  onCvvChange,
  onCancel,
}: Props) => {
  const amex = isAmex(bandeiraDetectada);

  return (
    <>
      <div className={styles['cartao-form-header']}>
        <CreditCard size={24} />
        <h4>Novo Cartão de Crédito</h4>
      </div>

      {erros.length > 0 && (
        <div className={styles['cartao-form-errors']} data-cy="checkout-card-errors">
          {erros.map((erro, index) => (
            <p key={index} className={styles['error-message']}>
              {erro}
            </p>
          ))}
        </div>
      )}

      <div className={styles['form-group']}>
        <label htmlFor="numero-cartao">Número do Cartão</label>
        <div className={styles['input-with-icon']}>
          <input
            id="numero-cartao"
            type="text"
            value={numero}
            onChange={onNumeroChange}
            placeholder="0000 0000 0000 0000"
            maxLength={23}
            required
            data-cy="checkout-card-number-input"
          />
          {bandeiraDetectada && (
            <span className={styles['bandeira-badge']} data-cy="checkout-card-brand">
              {bandeiraDetectada}
            </span>
          )}
        </div>
      </div>

      <div className={styles['form-group']}>
        <label htmlFor="nome-titular">Nome do Titular (como impresso no cartão)</label>
        <input
          id="nome-titular"
          type="text"
          value={nomeTitular}
          onChange={onNomeChange}
          placeholder="NOME DO TITULAR"
          required
          data-cy="checkout-card-name-input"
        />
      </div>

      <div className={styles['form-row']}>
        <div className={styles['form-group']}>
          <label htmlFor="validade">Validade (MM/AA)</label>
          <input
            id="validade"
            type="text"
            value={validade}
            onChange={onValidadeChange}
            placeholder="MM/AA"
            maxLength={5}
            required
            data-cy="checkout-card-expiry-input"
          />
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="cvv">CVV</label>
          <div className={styles['input-with-icon']}>
            <input
              id="cvv"
              type={mostrarCvv ? 'text' : 'password'}
              value={cvv}
              onChange={onCvvChange}
              placeholder={amex ? '0000' : '000'}
              maxLength={amex ? 4 : 3}
              required
              data-cy="checkout-card-cvv-input"
            />
            <button
              type="button"
              className={styles['toggle-cvv']}
              onClick={onToggleCvv}
              tabIndex={-1}
            >
              {mostrarCvv ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className={styles['form-group-checkbox']}>
        <label className={styles['checkbox-label']}>
          <input
            type="checkbox"
            checked={salvar}
            onChange={onSalvarChange}
            data-cy="checkout-save-card-checkbox"
          />
          <span>Salvar cartão para compras futuras</span>
        </label>
      </div>

      <div className={styles['form-actions']}>
        {onCancel && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            data-cy="checkout-card-cancel-button"
          >
            Cancelar
          </button>
        )}
        <button type="submit" className="btn-primary" data-cy="checkout-card-submit-button">
          Adicionar Cartão
        </button>
      </div>
    </>
  );
};
