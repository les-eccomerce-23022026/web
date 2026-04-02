import styles from './LoginArea.module.css';
import { LoginAreaEnderecoForm } from './LoginAreaEnderecoForm';
import type { LoginAreaRegisterState } from './loginAreaTypes';

type Props = {
  registerState: LoginAreaRegisterState;
};

export const LoginRegisterStep2 = ({ registerState }: Props) => (
  <div className={styles.stepContent}>
    <LoginAreaEnderecoForm
      titulo="Endereço de Cobrança (obrigatório)"
      endereco={registerState.regEnderecoCobranca}
      onChange={registerState.setRegEnderecoCobranca}
    />

    <div className={styles.checkboxRow}>
      <input
        type="checkbox"
        id="endereco-igual"
        checked={registerState.isEnderecoEntregaIgual}
        onChange={(e) => registerState.setIsEnderecoEntregaIgual(e.target.checked)}
      />
      <label htmlFor="endereco-igual">Endereço de entrega é o mesmo de cobrança</label>
    </div>

    {!registerState.isEnderecoEntregaIgual && (
      <LoginAreaEnderecoForm
        titulo="Endereço de Entrega (obrigatório)"
        endereco={registerState.regEnderecoEntrega}
        onChange={registerState.setRegEnderecoEntrega}
      />
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
        disabled={registerState.isRegistering}
        data-cy="register-submit-button"
      >
        {registerState.isRegistering ? 'Cadastrando...' : 'Finalizar Cadastro'}
      </button>
    </div>
  </div>
);
