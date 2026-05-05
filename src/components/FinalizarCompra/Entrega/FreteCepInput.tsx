import { MapPin } from 'lucide-react';
import styles from './FreteCalculo.style.module.css';

interface FreteCepInputProps {
  cep: string;
  loading: boolean;
  onCepChange: (cep: string) => void;
  onCalcular: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  error: Error | null;
}

export const FreteCepInput = ({
  cep,
  loading,
  onCepChange,
  onCalcular,
  onKeyPress,
  error
}: FreteCepInputProps) => {
  return (
    <div className={styles['cep-input-wrapper']}>
      <div className={styles['cep-input-group']}>
        <div className={styles['input-com-label']}>
          <label htmlFor="cep-destino">CEP de Destino</label>
          <div className={styles['cep-input-com-icon']}>
            <input
              id="cep-destino"
              type="text"
              value={cep}
              onChange={(e) => onCepChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="00000-000"
              maxLength={9}
              data-cy="checkout-freight-zip-input"
            />
            <MapPin size={18} className={styles['cep-icon']} />
          </div>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => void onCalcular()}
          disabled={loading}
          aria-busy={loading}
          data-cy="checkout-freight-calculate-button"
        >
          Calcular
        </button>
      </div>

      {loading && (
        <div className={styles['loading-bar']} role="status" aria-label="Calculando frete">
          <div className={styles['loading-bar-progress']}></div>
        </div>
      )}

      {error && (
        <p className={styles['erro']} role="alert" data-cy="checkout-freight-error">
          {error.message}
        </p>
      )}
    </div>
  );
};
