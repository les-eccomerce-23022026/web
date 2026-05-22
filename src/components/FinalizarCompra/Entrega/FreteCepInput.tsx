import { MapPin, AlertCircle, CheckCircle } from 'lucide-react';
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
  const validarCEP = (valor: string): { valido: boolean; mensagem?: string } => {
    const cepLimpo = valor.replace(/\D/g, '');
    if (cepLimpo.length === 0) return { valido: true };
    if (cepLimpo.length < 8) return { valido: false, mensagem: 'CEP deve ter 8 dígitos' };
    if (!/^\d{8}$/.test(cepLimpo)) return { valido: false, mensagem: 'CEP inválido' };
    return { valido: true };
  };

  const validacao = validarCEP(cep);
  const mostrarValidacao = cep.length > 0 && !loading;

  const formatarCEP = (valor: string): string => {
    const cepLimpo = valor.replace(/\D/g, '');
    if (cepLimpo.length <= 5) return cepLimpo;
    return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5, 9)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarCEP(e.target.value);
    onCepChange(valorFormatado);
  };

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
              onChange={handleChange}
              onKeyPress={onKeyPress}
              placeholder="00000-000"
              maxLength={9}
              aria-invalid={!validacao.valido}
              aria-describedby={validacao.mensagem ? 'cep-erro' : undefined}
              data-cy="checkout-freight-zip-input"
            />
            <MapPin size={18} className={styles['cep-icon']} />
          </div>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => void onCalcular()}
          disabled={loading || !validacao.valido}
          aria-busy={loading}
          data-cy="checkout-freight-calculate-button"
        >
          Calcular
        </button>
      </div>

      {mostrarValidacao && !validacao.valido && validacao.mensagem && (
        <div className={styles['validacao-inline']} role="alert" id="cep-erro">
          <AlertCircle size={14} />
          <span>{validacao.mensagem}</span>
        </div>
      )}

      {mostrarValidacao && validacao.valido && cep.length === 9 && (
        <div className={styles['validacao-sucesso']} role="status">
          <CheckCircle size={14} />
          <span>CEP válido</span>
        </div>
      )}

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
