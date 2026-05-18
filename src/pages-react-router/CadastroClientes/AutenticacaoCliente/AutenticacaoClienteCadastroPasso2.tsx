import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './style.module.css';
import type { AutenticacaoClienteCadastroState } from './autenticacaoClienteTypes';
import { REGEX_SENHA_FORTE } from './autenticacaoClienteValidacao';

type Props = {
  registerState: AutenticacaoClienteCadastroState;
};

export const AutenticacaoClienteCadastroPasso2 = ({ registerState }: Props) => {
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const validarTelefone = () => {
    if (!registerState.regTelefone.ddd || !registerState.regTelefone.numero) {
      setErrosCampo((prev) => ({ ...prev, telefone: 'Telefone (DDD e Número) é obrigatório.' }));
      return;
    }
    setErrosCampo((prev) => ({ ...prev, telefone: '' }));
  };

  const validarSenha = () => {
    if (!REGEX_SENHA_FORTE.test(registerState.regSenha)) {
      setErrosCampo((prev) => ({
        ...prev,
        senha: 'A senha deve conter pelo menos 8 caracteres, maiúsculas, minúsculas, números e especiais.',
      }));
      return;
    }
    setErrosCampo((prev) => ({ ...prev, senha: '' }));
  };

  const validarConfirmacaoSenha = () => {
    if (registerState.regSenha !== registerState.regConfirmaSenha) {
      setErrosCampo((prev) => ({ ...prev, confirmacaoSenha: 'As senhas não coincidem.' }));
      return;
    }
    setErrosCampo((prev) => ({ ...prev, confirmacaoSenha: '' }));
  };

  const limparErroCampo = (campo: string) => {
    if (errosCampo[campo]) {
      setErrosCampo((prev) => ({ ...prev, [campo]: '' }));
    }
  };

  return (
    <div className={styles.stepContent}>
      <div className="form-group">
        <label>Telefone</label>
        <div className={styles.telefoneGroup}>
          <div className={styles.telefoneField}>
            <label>Tipo</label>
            <select
              value={registerState.regTelefone.tipo}
              onChange={(e) => {
                registerState.setRegTelefone({ ...registerState.regTelefone, tipo: e.target.value as 'Celular' | 'Residencial' | 'Comercial' });
              }}
            >
              <option value="Celular">Celular</option>
              <option value="Residencial">Residencial</option>
              <option value="Comercial">Comercial</option>
            </select>
          </div>
          <div className={styles.telefoneField}>
            <label>DDD *</label>
            <input
              type="text"
              value={registerState.regTelefone.ddd}
              onChange={(e) => {
                registerState.setRegTelefone({ ...registerState.regTelefone, ddd: e.target.value });
                limparErroCampo('telefone');
              }}
              onBlur={validarTelefone}
              maxLength={2}
              data-cy="register-ddd-input"
            />
          </div>
          <div className={styles.telefoneField}>
            <label>Número *</label>
            <input
              type="text"
              value={registerState.regTelefone.numero}
              onChange={(e) => {
                registerState.setRegTelefone({ ...registerState.regTelefone, numero: e.target.value });
                limparErroCampo('telefone');
              }}
              onBlur={validarTelefone}
              maxLength={9}
              data-cy="register-telefone-input"
            />
          </div>
        </div>
        {errosCampo.telefone && (
          <p className={styles['auth-message-error']} style={{ marginTop: '4px', fontSize: '12px' }}>
            {errosCampo.telefone}
          </p>
        )}
      </div>

      <div className="form-group">
        <label>Senha *</label>
        <div className={styles.passwordWrapper}>
          <input
            type={mostrarSenha ? 'text' : 'password'}
            value={registerState.regSenha}
            onChange={(e) => {
              registerState.setRegSenha(e.target.value);
              limparErroCampo('senha');
            }}
            onBlur={validarSenha}
            className={errosCampo.senha ? styles['input-error'] : ''}
            data-cy="register-senha-input"
          />
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setMostrarSenha(!mostrarSenha)}
          >
            {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <p className={styles.passwordHint}>Mín. 8 caracteres, letras maiúsculas/minúsculas, números e especiais</p>
        {errosCampo.senha && (
          <p className={styles['auth-message-error']} style={{ marginTop: '4px', fontSize: '12px' }}>
            {errosCampo.senha}
          </p>
        )}
      </div>

      <div className="form-group">
        <label>Confirmar Senha *</label>
        <div className={styles.passwordWrapper}>
          <input
            type={mostrarConfirmacao ? 'text' : 'password'}
            value={registerState.regConfirmaSenha}
            onChange={(e) => {
              registerState.setRegConfirmaSenha(e.target.value);
              limparErroCampo('confirmacaoSenha');
            }}
            onBlur={validarConfirmacaoSenha}
            className={errosCampo.confirmacaoSenha ? styles['input-error'] : ''}
            data-cy="register-confirmar-senha-input"
          />
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
          >
            {mostrarConfirmacao ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errosCampo.confirmacaoSenha && (
          <p className={styles['auth-message-error']} style={{ marginTop: '4px', fontSize: '12px' }}>
            {errosCampo.confirmacaoSenha}
          </p>
        )}
      </div>

      <div className={styles['auth-form-actions']}>
        <button
          className={`btn-secondary ${styles['login-btn-register']}`}
          onClick={registerState.handlePrevStep}
        >
          ← Voltar
        </button>
        <button
          className={`btn-primary ${styles['login-btn-register']}`}
          onClick={registerState.handleNextStep}
          disabled={!!errosCampo.telefone || !!errosCampo.senha || !!errosCampo.confirmacaoSenha}
          data-cy="register-step2-next-button"
        >
          Próximo: Endereço →
        </button>
      </div>
    </div>
  );
};
