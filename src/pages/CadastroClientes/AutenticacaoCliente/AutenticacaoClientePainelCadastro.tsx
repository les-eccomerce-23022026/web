import styles from './AutenticacaoCliente.module.css';
import { AutenticacaoClienteConviteCadastro } from './AutenticacaoClienteConviteCadastro';
import { AutenticacaoClienteWizardCadastro } from './AutenticacaoClienteWizardCadastro';
import type { AutenticacaoClienteCadastroState, AutenticacaoClienteDominios } from './autenticacaoClienteTypes';

type Props = {
  registerState: AutenticacaoClienteCadastroState;
  dominios: AutenticacaoClienteDominios;
};

export const AutenticacaoClientePainelCadastro = ({ registerState, dominios }: Props) => (
  <div className={`card ${styles['register-box-card']}`}>
    {!registerState.showRegister ? (
      <AutenticacaoClienteConviteCadastro registerState={registerState} />
    ) : (
      <AutenticacaoClienteWizardCadastro registerState={registerState} dominios={dominios} />
    )}
  </div>
);
