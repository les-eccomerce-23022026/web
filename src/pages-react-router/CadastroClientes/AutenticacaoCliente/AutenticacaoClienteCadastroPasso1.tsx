import { useState } from 'react';
import styles from './style.module.css';
import type { AutenticacaoClienteCadastroState, AutenticacaoClienteDominios } from './autenticacaoClienteTypes';
import {
  REGEX_CPF_COM_MASCARA,
  REGEX_CPF_SEM_MASCARA,
} from './autenticacaoClienteValidacao';

type Props = {
  registerState: AutenticacaoClienteCadastroState;
  dominios: AutenticacaoClienteDominios;
};

export const AutenticacaoClienteCadastroPasso1 = ({ registerState, dominios }: Props) => {
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});

  const validarNome = () => {
    if (!registerState.regNome.trim()) {
      setErrosCampo((prev) => ({ ...prev, nome: 'Nome é obrigatório.' }));
      return;
    }
    setErrosCampo((prev) => ({ ...prev, nome: '' }));
  };

  const validarCpf = () => {
    const cpfLimpo = registerState.regCpf.trim();
    const ok = REGEX_CPF_COM_MASCARA.test(cpfLimpo) || REGEX_CPF_SEM_MASCARA.test(cpfLimpo);
    if (!ok) {
      setErrosCampo((prev) => ({
        ...prev,
        cpf: 'CPF inválido. Use 000.000.000-00 ou apenas 11 números.',
      }));
      return;
    }
    setErrosCampo((prev) => ({ ...prev, cpf: '' }));
  };

  const validarEmail = () => {
    if (!registerState.regEmail.trim() || !registerState.regEmail.includes('@')) {
      setErrosCampo((prev) => ({ ...prev, email: 'Informe um e-mail válido.' }));
      return;
    }
    setErrosCampo((prev) => ({ ...prev, email: '' }));
  };

  const validarDataNascimento = () => {
    if (!registerState.regDataNascimento) {
      setErrosCampo((prev) => ({ ...prev, dataNascimento: 'Data de nascimento é obrigatória.' }));
      return;
    }
    setErrosCampo((prev) => ({ ...prev, dataNascimento: '' }));
  };


  const limparErroCampo = (campo: string) => {
    if (errosCampo[campo]) {
      setErrosCampo((prev) => ({ ...prev, [campo]: '' }));
    }
  };

  return (
    <div className={styles.stepContent}>
      <div className="form-group">
        <label>Nome Completo *</label>
        <input
          type="text"
          value={registerState.regNome}
          onChange={(e) => {
            registerState.setRegNome(e.target.value);
            limparErroCampo('nome');
          }}
          onBlur={validarNome}
          className={errosCampo.nome ? styles['input-error'] : ''}
          data-cy="register-nome-input"
        />
        {errosCampo.nome && (
          <p className={styles['auth-message-error']} style={{ marginTop: '4px', fontSize: '12px' }}>
            {errosCampo.nome}
          </p>
        )}
      </div>
      <div className="form-group">
        <label>CPF * (11 números ou 000.000.000-00)</label>
        <input
          type="text"
          placeholder="Ex: 12345678901"
          value={registerState.regCpf}
          onChange={(e) => {
            registerState.setRegCpf(e.target.value);
            limparErroCampo('cpf');
          }}
          onBlur={validarCpf}
          className={errosCampo.cpf ? styles['input-error'] : ''}
          data-cy="register-cpf-input"
        />
        {errosCampo.cpf && (
          <p className={styles['auth-message-error']} style={{ marginTop: '4px', fontSize: '12px' }}>
            {errosCampo.cpf}
          </p>
        )}
      </div>
      <div className="form-group">
        <label>E-mail *</label>
        <input
          type="email"
          value={registerState.regEmail}
          onChange={(e) => {
            registerState.setRegEmail(e.target.value);
            limparErroCampo('email');
          }}
          onBlur={validarEmail}
          className={errosCampo.email ? styles['input-error'] : ''}
          data-cy="register-email-input"
        />
        {errosCampo.email && (
          <p className={styles['auth-message-error']} style={{ marginTop: '4px', fontSize: '12px' }}>
            {errosCampo.email}
          </p>
        )}
      </div>
      <div className={styles.formRow}>
        <div className="form-group">
          <label>Gênero *</label>
          <select
            value={registerState.regGenero}
            onChange={(e) =>
              registerState.setRegGenero(e.target.value as typeof registerState.regGenero)
            }
            data-cy="register-genero-select"
          >
            {dominios.generosDisponiveis.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Data de Nascimento *</label>
          <input
            type="date"
            value={registerState.regDataNascimento}
            onChange={(e) => {
              registerState.setRegDataNascimento(e.target.value);
              limparErroCampo('dataNascimento');
            }}
            onBlur={validarDataNascimento}
            className={errosCampo.dataNascimento ? styles['input-error'] : ''}
            data-cy="register-nascimento-input"
          />
          {errosCampo.dataNascimento && (
            <p className={styles['auth-message-error']} style={{ marginTop: '4px', fontSize: '12px' }}>
              {errosCampo.dataNascimento}
            </p>
          )}
        </div>
      </div>

      <div className={styles['auth-form-actions']}>
        <button
          className={`btn-primary ${styles['login-btn-register']}`}
          onClick={registerState.handleNextStep}
          disabled={!!errosCampo.nome || !!errosCampo.cpf || !!errosCampo.email || !!errosCampo.dataNascimento}
          data-cy="register-step1-next-button"
        >
          Próximo: Contato e Senha →
        </button>
      </div>
    </div>
  );
};
