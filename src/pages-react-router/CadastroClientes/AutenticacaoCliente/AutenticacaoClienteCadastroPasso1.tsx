import { useState } from 'react';
import styles from './style.module.css';
import type { AutenticacaoClienteCadastroState, AutenticacaoClienteDominios } from './autenticacaoClienteTypes';
import {
  REGEX_CPF_COM_MASCARA,
  REGEX_CPF_SEM_MASCARA,
} from './autenticacaoClienteValidacao';
import { validarCpf } from '../../../utils/validacaoCpf';
import { useDebounceValidation } from '../../../hooks/useDebounceValidation';

type Props = {
  registerState: AutenticacaoClienteCadastroState;
  dominios: AutenticacaoClienteDominios;
};

export const AutenticacaoClienteCadastroPasso1 = ({ registerState, dominios }: Props) => {
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});

  // Validação com debounce para CPF
  const validacaoCpf = useDebounceValidation<string>({
    validationFn: (cpf) => {
      const formatoValido = REGEX_CPF_COM_MASCARA.test(cpf) || REGEX_CPF_SEM_MASCARA.test(cpf);
      if (!formatoValido) {
        return 'CPF inválido. Use 000.000.000-00 ou apenas 11 números.';
      }
      if (!validarCpf(cpf)) {
        return 'CPF inválido. Verifique os dígitos informados.';
      }
      return null;
    },
    delay: 300,
  });

  // Validação com debounce para email
  const validacaoEmail = useDebounceValidation<string>({
    validationFn: (email) => {
      if (!email.trim() || !email.includes('@')) {
        return 'Informe um e-mail válido.';
      }
      return null;
    },
    delay: 300,
  });

  const validarNome = () => {
    if (!registerState.regNome.trim()) {
      setErrosCampo((prev) => ({ ...prev, nome: 'Nome é obrigatório.' }));
      return;
    }
    setErrosCampo((prev) => ({ ...prev, nome: '' }));
  };

  const validarCampoCpf = () => {
    validacaoCpf.validate(registerState.regCpf.trim());
  };

  const validarEmail = () => {
    validacaoEmail.validate(registerState.regEmail.trim());
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
          onBlur={() => {
            validarNome();
          }}
          className={errosCampo.nome ? styles['input-error'] : ''}
          data-cy="register-nome-input"
        />
        {errosCampo.nome && (
          <p className={styles['auth-message-error-field']}>
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
            validacaoCpf.validate(e.target.value);
          }}
          onBlur={() => {
            validarCampoCpf();
          }}
          className={errosCampo.cpf ? styles['input-error'] : ''}
          data-cy="register-cpf-input"
        />
        {validacaoCpf.error && (
          <p className={styles['auth-message-error-field']}>
            {validacaoCpf.error}
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
            validacaoEmail.validate(e.target.value);
          }}
          onBlur={() => {
            validarEmail();
          }}
          className={errosCampo.email ? styles['input-error'] : ''}
          data-cy="register-email-input"
        />
        {validacaoEmail.error && (
          <p className={styles['auth-message-error-field']}>
            {validacaoEmail.error}
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
            onBlur={() => {
              validarDataNascimento();
            }}
            className={errosCampo.dataNascimento ? styles['input-error'] : ''}
            data-cy="register-nascimento-input"
          />
          {errosCampo.dataNascimento && (
            <p className={styles['auth-message-error-field']}>
              {errosCampo.dataNascimento}
            </p>
          )}
        </div>
      </div>

      <div className={styles['admin-option-container']}>
        <label className={styles['admin-option-label']}>
          <input
            type="checkbox"
            checked={registerState.regQuerSerAdmin}
            onChange={(e) => registerState.setRegQuerSerAdmin(e.target.checked)}
            data-cy="register-admin-checkbox"
          />
          <span>Quero criar minha loja como administrador</span>
        </label>
        <p className={styles['admin-option-hint']}>
          Cadastre-se como administrador para gerenciar sua própria livraria online.
        </p>
      </div>

      <div className={styles['auth-form-actions']}>
        <button
          className={`btn-primary ${styles['login-btn-register']}`}
          onClick={registerState.handleNextStep}
          disabled={!!errosCampo.nome || !!validacaoCpf.error || !!validacaoEmail.error || !!errosCampo.dataNascimento}
          data-cy="register-step1-next-button"
        >
          Próximo: Contato e Senha →
        </button>
      </div>
    </div>
  );
};
