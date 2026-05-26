import styles from './style.module.css';
import { AutenticacaoClienteConviteCadastro } from './AutenticacaoClienteConviteCadastro';
import { AutenticacaoClienteWizardCadastro } from './AutenticacaoClienteWizardCadastro';
import type { AutenticacaoClienteCadastroState, AutenticacaoClienteDominios } from './autenticacaoClienteTypes';

type Props = {
  registerState: AutenticacaoClienteCadastroState;
  dominios: AutenticacaoClienteDominios;
};

export const AutenticacaoClientePainelCadastro = ({ registerState, dominios }: Props) => (
  <div className={`card ${styles['register-box-card']}`}>
    {registerState.regSuccess && (
      <p className={styles['auth-message-success']}>{registerState.regSuccess}</p>
    )}
    {!registerState.showRegister ? (
      <AutenticacaoClienteConviteCadastro registerState={registerState} />
    ) : (
      <AutenticacaoClienteWizardCadastro registerState={registerState} dominios={dominios} />
    )}
  </div>
);
