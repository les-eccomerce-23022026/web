import styles from './AutenticacaoCliente.module.css';
import { AutenticacaoClienteEnderecoForm } from './AutenticacaoClienteEnderecoForm';
import type { AutenticacaoClienteCadastroState } from './autenticacaoClienteTypes';

type Props = {
  registerState: AutenticacaoClienteCadastroState;
};

export const AutenticacaoClienteCadastroPasso2 = ({ registerState }: Props) => (
  <div className={styles.stepContent}>
    <AutenticacaoClienteEnderecoForm
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
      <AutenticacaoClienteEnderecoForm
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
