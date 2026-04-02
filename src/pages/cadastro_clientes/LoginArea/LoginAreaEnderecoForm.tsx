import styles from './LoginArea.module.css';
import type { IEnderecoCliente } from '@/interfaces/IPagamento';

type Props = {
  titulo: string;
  endereco: Omit<IEnderecoCliente, 'uuid'>;
  onChange: (e: Omit<IEnderecoCliente, 'uuid'>) => void;
};

export const LoginAreaEnderecoForm = ({ titulo, endereco, onChange }: Props) => {
  const handleField = (campo: string, valor: string) => {
    onChange({ ...endereco, [campo]: valor });
  };

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{titulo}</legend>
      <div className={styles.formRow}>
        <div className={`form-group ${styles.formGroupLarge}`}>
          <label>Logradouro *</label>
          <input
            type="text"
            placeholder="Nome da rua"
            value={endereco.logradouro}
            onChange={(e) => handleField('logradouro', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Número *</label>
          <input
            type="text"
            placeholder="123"
            value={endereco.numero}
            onChange={(e) => handleField('numero', e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Complemento</label>
        <input
          type="text"
          placeholder="Apto, Bloco..."
          value={endereco.complemento}
          onChange={(e) => handleField('complemento', e.target.value)}
        />
      </div>
      <div className={styles.formRow}>
        <div className="form-group">
          <label>Bairro *</label>
          <input
            type="text"
            value={endereco.bairro}
            onChange={(e) => handleField('bairro', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>CEP *</label>
          <input
            type="text"
            placeholder="00000-000"
            value={endereco.cep}
            onChange={(e) => handleField('cep', e.target.value)}
          />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className="form-group">
          <label>Cidade *</label>
          <input
            type="text"
            value={endereco.cidade}
            onChange={(e) => handleField('cidade', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Estado *</label>
          <input
            type="text"
            placeholder="SP"
            maxLength={2}
            value={endereco.estado}
            onChange={(e) => handleField('estado', e.target.value.toUpperCase())}
          />
        </div>
      </div>
    </fieldset>
  );
};
