import { Eye, EyeOff } from 'lucide-react';
import type { ChangeEvent } from 'react';
import styles from './CartaoCreditoForm.style.module.css';

type Props = {
  numero: string;
  nomeTitular: string;
  validade: string;
  cvv: string;
  mostrarCvv: boolean;
  bandeiraDetectada: string | null;
  cvvPlaceholder: string;
  cvvMaxLength: number;
  onNomeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onNumeroChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onValidadeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCvvChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onToggleCvv: () => void;
};

export const CartaoCreditoFormCampos = ({
  numero,
  nomeTitular,
  validade,
  cvv,
  mostrarCvv,
  bandeiraDetectada,
  cvvPlaceholder,
  cvvMaxLength,
  onNomeChange,
  onNumeroChange,
  onValidadeChange,
  onCvvChange,
  onToggleCvv,
}: Props) => {
  return (
    <>
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
          {bandeiraDetectada ? (
            <span className={styles['bandeira-badge']} data-cy="checkout-card-brand">
              {bandeiraDetectada}
            </span>
          ) : null}
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
              placeholder={cvvPlaceholder}
              maxLength={cvvMaxLength}
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
    </>
  );
};
