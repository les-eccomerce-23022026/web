import { useState } from 'react';
import styles from './style.module.css';
import type { AutenticacaoClienteCadastroState } from './autenticacaoClienteTypes';

type Props = {
  registerState: AutenticacaoClienteCadastroState;
};

export const AutenticacaoClienteCadastroPasso3 = ({ registerState }: Props) => {
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});

  const validarNomeFantasia = () => {
    if (!registerState.regNomeFantasiaLoja.trim()) {
      setErrosCampo((prev) => ({ ...prev, nomeFantasia: 'Nome fantasia é obrigatório.' }));
      return;
    }
    setErrosCampo((prev) => ({ ...prev, nomeFantasia: '' }));
  };

  const validarCnpj = () => {
    if (registerState.regTipoPessoaLoja === 'PJ' && !registerState.regCnpjLoja.trim()) {
      setErrosCampo((prev) => ({ ...prev, cnpj: 'CNPJ é obrigatório para pessoa jurídica.' }));
      return;
    }
    setErrosCampo((prev) => ({ ...prev, cnpj: '' }));
  };

  const limparErroCampo = (campo: string) => {
    if (errosCampo[campo]) {
      setErrosCampo((prev) => ({ ...prev, [campo]: '' }));
    }
  };

  return (
    <div className={styles.stepContent}>
      <h3 className={styles['step-title']}>Dados da Loja</h3>
      <p className={styles['step-description']}>
        Cadastre os dados da sua livraria para se tornar um administrador.
      </p>

      <div className="form-group">
        <label>Tipo de Pessoa *</label>
        <select
          value={registerState.regTipoPessoaLoja}
          onChange={(e) => {
            registerState.setRegTipoPessoaLoja(e.target.value as 'PF' | 'PJ');
            limparErroCampo('cnpj');
          }}
          data-cy="register-tipo-pessoa-loja-select"
        >
          <option value="PJ">Pessoa Jurídica (CNPJ)</option>
          <option value="PF">Pessoa Física (CPF)</option>
        </select>
      </div>

      <div className="form-group">
        <label>Nome Fantasia *</label>
        <input
          type="text"
          placeholder="Ex: Livraria do João"
          value={registerState.regNomeFantasiaLoja}
          onChange={(e) => {
            registerState.setRegNomeFantasiaLoja(e.target.value);
            limparErroCampo('nomeFantasia');
          }}
          onBlur={validarNomeFantasia}
          className={errosCampo.nomeFantasia ? styles['input-error'] : ''}
          data-cy="register-nome-fantasia-input"
        />
        {errosCampo.nomeFantasia && (
          <p className={styles['auth-message-error-field']}>
            {errosCampo.nomeFantasia}
          </p>
        )}
      </div>

      {registerState.regTipoPessoaLoja === 'PJ' && (
        <div className="form-group">
          <label>CNPJ *</label>
          <input
            type="text"
            placeholder="Ex: 00.000.000/0001-91"
            value={registerState.regCnpjLoja}
            onChange={(e) => {
              registerState.setRegCnpjLoja(e.target.value);
              limparErroCampo('cnpj');
            }}
            onBlur={validarCnpj}
            className={errosCampo.cnpj ? styles['input-error'] : ''}
            data-cy="register-cnpj-loja-input"
          />
          {errosCampo.cnpj && (
            <p className={styles['auth-message-error-field']}>
              {errosCampo.cnpj}
            </p>
          )}
        </div>
      )}

      {registerState.regTipoPessoaLoja === 'PF' && (
        <p className={styles['info-msg']}>
          Será utilizado o CPF informado no passo 1 como documento da loja.
        </p>
      )}

      <div className={styles['auth-form-actions']}>
        <button
          className={`btn-secondary ${styles['login-btn-register']}`}
          onClick={registerState.handlePrevStep}
        >
          ← Voltar
        </button>
        <button
          className={`btn-primary ${styles['login-btn-register']}`}
          onClick={registerState.handleRegister}
          disabled={
            !!errosCampo.nomeFantasia ||
            !!errosCampo.cnpj ||
            (registerState.regTipoPessoaLoja === 'PJ' && !registerState.regCnpjLoja.trim()) ||
            !registerState.regNomeFantasiaLoja.trim() ||
            registerState.isRegistering
          }
          data-cy="register-submit-button"
        >
          {registerState.isRegistering ? 'Cadastrando...' : 'Finalizar Cadastro'}
        </button>
      </div>
    </div>
  );
};
