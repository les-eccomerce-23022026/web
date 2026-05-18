import { useState } from 'react';
import styles from './style.module.css';
import type { IEnderecoCliente } from '../../../interfaces/pagamento';

type Props = {
  titulo: string;
  endereco: Omit<IEnderecoCliente, 'uuid'>;
  onChange: (e: Omit<IEnderecoCliente, 'uuid'>) => void;
};

export const AutenticacaoClienteEnderecoForm = ({ titulo, endereco, onChange }: Props) => {
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});

  const validarCampoObrigatorio = (campo: string, valor: string, nomeCampo: string) => {
    if (!valor.trim()) {
      setErrosCampo((prev) => ({ ...prev, [campo]: `${nomeCampo} é obrigatório.` }));
      return;
    }
    setErrosCampo((prev) => ({ ...prev, [campo]: '' }));
  };

  const handleField = (campo: string, valor: string) => {
    onChange({ ...endereco, [campo]: valor });
    if (errosCampo[campo]) {
      setErrosCampo((prev) => ({ ...prev, [campo]: '' }));
    }
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
            onBlur={() => validarCampoObrigatorio('logradouro', endereco.logradouro, 'Logradouro')}
            className={errosCampo.logradouro ? styles['input-error'] : ''}
          />
          {errosCampo.logradouro && (
            <p className={styles['auth-message-error']} style={{ marginTop: '4px', fontSize: '12px' }}>
              {errosCampo.logradouro}
            </p>
          )}
        </div>
        <div className="form-group">
          <label>Número *</label>
          <input
            type="text"
            placeholder="123"
            value={endereco.numero}
            onChange={(e) => handleField('numero', e.target.value)}
            onBlur={() => validarCampoObrigatorio('numero', endereco.numero, 'Número')}
            className={errosCampo.numero ? styles['input-error'] : ''}
          />
          {errosCampo.numero && (
            <p className={styles['auth-message-error']} style={{ marginTop: '4px', fontSize: '12px' }}>
              {errosCampo.numero}
            </p>
          )}
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
            onBlur={() => validarCampoObrigatorio('bairro', endereco.bairro, 'Bairro')}
            className={errosCampo.bairro ? styles['input-error'] : ''}
          />
          {errosCampo.bairro && (
            <p className={styles['auth-message-error']} style={{ marginTop: '4px', fontSize: '12px' }}>
              {errosCampo.bairro}
            </p>
          )}
        </div>
        <div className="form-group">
          <label>CEP *</label>
          <input
            type="text"
            placeholder="00000-000"
            value={endereco.cep}
            onChange={(e) => handleField('cep', e.target.value)}
            onBlur={() => validarCampoObrigatorio('cep', endereco.cep, 'CEP')}
            className={errosCampo.cep ? styles['input-error'] : ''}
          />
          {errosCampo.cep && (
            <p className={styles['auth-message-error']} style={{ marginTop: '4px', fontSize: '12px' }}>
              {errosCampo.cep}
            </p>
          )}
        </div>
      </div>
      <div className={styles.formRow}>
        <div className="form-group">
          <label>Cidade *</label>
          <input
            type="text"
            value={endereco.cidade}
            onChange={(e) => handleField('cidade', e.target.value)}
            onBlur={() => validarCampoObrigatorio('cidade', endereco.cidade, 'Cidade')}
            className={errosCampo.cidade ? styles['input-error'] : ''}
          />
          {errosCampo.cidade && (
            <p className={styles['auth-message-error']} style={{ marginTop: '4px', fontSize: '12px' }}>
              {errosCampo.cidade}
            </p>
          )}
        </div>
        <div className="form-group">
          <label>Estado *</label>
          <input
            type="text"
            placeholder="SP"
            maxLength={2}
            value={endereco.estado}
            onChange={(e) => handleField('estado', e.target.value.toUpperCase())}
            onBlur={() => validarCampoObrigatorio('estado', endereco.estado, 'Estado')}
            className={errosCampo.estado ? styles['input-error'] : ''}
          />
          {errosCampo.estado && (
            <p className={styles['auth-message-error']} style={{ marginTop: '4px', fontSize: '12px' }}>
              {errosCampo.estado}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
};
