import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './style.module.css';
import type { AutenticacaoClienteCadastroState } from './autenticacaoClienteTypes';
import { REGEX_SENHA_FORTE } from './autenticacaoClienteValidacao';
import { useDebounceValidation } from '../../../hooks/useDebounceValidation';

type Props = {
  registerState: AutenticacaoClienteCadastroState;
};

export const AutenticacaoClienteCadastroPasso2 = ({ registerState }: Props) => {
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  // Validação com debounce para senha
  const validacaoSenha = useDebounceValidation<string>({
    validationFn: (senha) => {
      if (!REGEX_SENHA_FORTE.test(senha)) {
        return 'A senha deve conter pelo menos 8 caracteres, maiúsculas, minúsculas, números e especiais.';
      }
      return null;
    },
    delay: 300,
  });

  // Validação com debounce para confirmação de senha
  const validacaoConfirmacaoSenha = useDebounceValidation<string>({
    validationFn: (confirmacao) => {
      if (registerState.regSenha !== confirmacao) {
        return 'As senhas não coincidem.';
      }
      return null;
    },
    delay: 300,
  });

  // Validação com debounce para telefone
  const validacaoTelefone = useDebounceValidation<{ numero: string }>({
    validationFn: (telefone) => {
      if (!telefone.numero) {
        return 'Telefone é obrigatório.';
      }
      return null;
    },
    delay: 300,
  });

  const validarTelefone = () => {
    if (!registerState.regTelefone.numero) {
      setErrosCampo((prev) => ({ ...prev, telefone: 'Telefone é obrigatório.' }));
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

  const handleCampoTocado = (campo: string) => {
    setTouched((prev) => ({ ...prev, [campo]: true }));
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
            <label>Número (com DDD) *</label>
            <input
              type="text"
              value={registerState.regTelefone.numero}
              onChange={(e) => {
                registerState.setRegTelefone({ ...registerState.regTelefone, numero: e.target.value });
                limparErroCampo('telefone');
                validacaoTelefone.validate({ numero: e.target.value });
              }}
              onBlur={() => {
                handleCampoTocado('telefone');
                validarTelefone();
              }}
              maxLength={11}
              data-cy="register-telefone-input"
            />
          </div>
        </div>
        {(touched.telefone && validacaoTelefone.error) && (
          <p className={styles['auth-message-error-field']}>
            {validacaoTelefone.error}
          </p>
        )}
        {(!touched.telefone && errosCampo.telefone) && (
          <p className={styles['auth-message-error-field']}>
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
              validacaoSenha.validate(e.target.value);
            }}
            onBlur={() => {
              handleCampoTocado('senha');
              validarSenha();
            }}
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
        {(touched.senha && validacaoSenha.error) && (
          <p className={styles['auth-message-error-field']}>
            {validacaoSenha.error}
          </p>
        )}
        {(!touched.senha && errosCampo.senha) && (
          <p className={styles['auth-message-error-field']}>
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
              validacaoConfirmacaoSenha.validate(e.target.value);
            }}
            onBlur={() => {
              handleCampoTocado('confirmacaoSenha');
              validarConfirmacaoSenha();
            }}
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
        {(touched.confirmacaoSenha && validacaoConfirmacaoSenha.error) && (
          <p className={styles['auth-message-error-field']}>
            {validacaoConfirmacaoSenha.error}
          </p>
        )}
        {(!touched.confirmacaoSenha && errosCampo.confirmacaoSenha) && (
          <p className={styles['auth-message-error-field']}>
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
          disabled={!!errosCampo.telefone || !!errosCampo.senha || !!errosCampo.confirmacaoSenha || registerState.isRegistering}
          data-cy="register-step2-next-button"
        >
          {registerState.regQuerSerAdmin ? 'Próximo: Dados da Loja →' : 'Finalizar Cadastro'}
        </button>
      </div>
    </div>
  );
};
