import { useEnderecoForm } from './useEnderecoForm';
import styles from './EnderecoForm.module.css';
import type { IEnderecoCliente } from '@/interfaces/pagamento';

export interface EnderecoFormProps {
  initialData?: Partial<IEnderecoCliente>;
  onSubmit: (data: Omit<IEnderecoCliente, 'uuid'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EnderecoForm = ({ initialData, onSubmit, onCancel, isLoading }: EnderecoFormProps) => {
  const {
    logradouro, setLogradouro,
    numero, setNumero,
    complemento, setComplemento,
    bairro, setBairro,
    cep, setCep,
    cidade, setCidade,
    estado, setEstado,
    isSubmitting,
    handleSubmit
  } = useEnderecoForm({ initialData, onSubmit });

  const loading = isLoading || isSubmitting;

  return (
    <form className={styles.enderecoForm} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <div className={styles.formGroupLarge}>
          <label htmlFor="logradouro">Logradouro *</label>
          <input
            id="logradouro"
            data-cy="endereco-logradouro-input"
            type="text"
            required
            value={logradouro}
            onChange={(e) => setLogradouro(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="numero">Número *</label>
          <input
            id="numero"
            data-cy="endereco-numero-input"
            type="text"
            required
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="complemento">Complemento</label>
        <input
          id="complemento"
          data-cy="endereco-complemento-input"
          type="text"
          value={complemento}
          onChange={(e) => setComplemento(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="bairro">Bairro *</label>
          <input
            id="bairro"
            data-cy="endereco-bairro-input"
            type="text"
            required
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="cep">CEP *</label>
          <input
            id="cep"
            data-cy="endereco-cep-input"
            type="text"
            required
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="cidade">Cidade *</label>
          <input
            id="cidade"
            data-cy="endereco-cidade-input"
            type="text"
            required
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="estado">Estado *</label>
          <input
            id="estado"
            data-cy="endereco-estado-input"
            type="text"
            required
            maxLength={2}
            value={estado}
            onChange={(e) => setEstado(e.target.value.toUpperCase())}
            disabled={loading}
          />
        </div>
      </div>
      <div className={styles.formActions}>
        <button
          type="submit"
          data-cy="endereco-submit-button"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Salvando...' : (initialData?.uuid ? 'Salvar Alterações' : 'Salvar Endereço')}
        </button>
        <button
          type="button"
          data-cy="endereco-cancel-button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
