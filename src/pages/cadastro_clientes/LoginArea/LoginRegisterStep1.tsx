import { Eye, EyeOff } from 'lucide-react';
import styles from './LoginArea.module.css';
import type { LoginAreaRegisterState, LoginAreaDominios } from './loginAreaTypes';

type Props = {
  registerState: LoginAreaRegisterState;
  dominios: LoginAreaDominios;
};

export const LoginRegisterStep1 = ({ registerState, dominios }: Props) => (
  <div className={styles.stepContent}>
    <div className="form-group">
      <label>Nome Completo *</label>
      <input
        type="text"
        value={registerState.regNome}
        onChange={(e) => registerState.setRegNome(e.target.value)}
        data-cy="register-nome-input"
      />
    </div>
    <div className="form-group">
      <label>CPF * (11 números ou 000.000.000-00)</label>
      <input
        type="text"
        placeholder="Ex: 12345678901"
        value={registerState.regCpf}
        onChange={(e) => registerState.setRegCpf(e.target.value)}
        data-cy="register-cpf-input"
      />
    </div>
    <div className="form-group">
      <label>E-mail *</label>
      <input
        type="email"
        value={registerState.regEmail}
        onChange={(e) => registerState.setRegEmail(e.target.value)}
        data-cy="register-email-input"
      />
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
          onChange={(e) => registerState.setRegDataNascimento(e.target.value)}
          data-cy="register-nascimento-input"
        />
      </div>
    </div>
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Telefone</legend>
      <div className={styles.formRow}>
        <div className="form-group">
          <label>Tipo</label>
          <select
            value={registerState.regTelefone.tipo}
            onChange={(e) =>
              registerState.setRegTelefone({
                ...registerState.regTelefone,
                tipo: e.target.value as 'Celular' | 'Residencial' | 'Comercial',
              })
            }
          >
            {dominios.tiposTelefone.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>DDD *</label>
          <input
            type="text"
            placeholder="11"
            maxLength={2}
            value={registerState.regTelefone.ddd}
            onChange={(e) =>
              registerState.setRegTelefone({
                ...registerState.regTelefone,
                ddd: e.target.value,
              })
            }
          />
        </div>
        <div className={`form-group ${styles.formGroupLarge}`}>
          <label>Número *</label>
          <input
            type="text"
            placeholder="999887766"
            value={registerState.regTelefone.numero}
            onChange={(e) =>
              registerState.setRegTelefone({
                ...registerState.regTelefone,
                numero: e.target.value,
              })
            }
          />
        </div>
      </div>
    </fieldset>
    <div className="form-group">
      <label>Senha *</label>
      <div className={styles.passwordWrapper}>
        <input
          type={registerState.showPasswordRegister ? 'text' : 'password'}
          className={styles.passwordInput}
          value={registerState.regSenha}
          onChange={(e) => registerState.setRegSenha(e.target.value)}
          data-cy="register-senha-input"
        />
        <button
          data-cy="register-password-toggle"
          type="button"
          className={styles.passwordToggle}
          onClick={() =>
            registerState.setShowPasswordRegister(!registerState.showPasswordRegister)
          }
          aria-label={
            registerState.showPasswordRegister ? 'Esconder senha' : 'Mostrar senha'
          }
        >
          {registerState.showPasswordRegister ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      <small className={styles.hint}>
        Mín. 8 caracteres, letras maiúsculas/minúsculas, números e especiais
      </small>
    </div>
    <div className="form-group">
      <label>Confirmar Senha *</label>
      <div className={styles.passwordWrapper}>
        <input
          type={registerState.showConfirmPasswordRegister ? 'text' : 'password'}
          className={styles.passwordInput}
          value={registerState.regConfirmaSenha}
          onChange={(e) => registerState.setRegConfirmaSenha(e.target.value)}
          data-cy="register-confirmacao-senha-input"
        />
        <button
          data-cy="register-password-toggle"
          type="button"
          className={styles.passwordToggle}
          onClick={() =>
            registerState.setShowConfirmPasswordRegister(
              !registerState.showConfirmPasswordRegister,
            )
          }
          aria-label={
            registerState.showConfirmPasswordRegister ? 'Esconder senha' : 'Mostrar senha'
          }
        >
          {registerState.showConfirmPasswordRegister ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      </div>
    </div>
    <div className={styles['auth-form-actions']}>
      <button
        className={`btn-primary ${styles['login-btn-register']}`}
        onClick={registerState.handleNextStep}
        data-cy="register-next-step-button"
      >
        Próximo: Endereço →
      </button>
      <button
        className={`btn-secondary ${styles['login-btn-register']}`}
        onClick={registerState.handleCancelRegister}
      >
        Cancelar
      </button>
    </div>
  </div>
);
