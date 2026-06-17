import styles from './style.module.css';
import { AutenticacaoClienteCadastroPasso1 } from './AutenticacaoClienteCadastroPasso1';
import { AutenticacaoClienteCadastroPasso2 } from './AutenticacaoClienteCadastroPasso2';
import { AutenticacaoClienteCadastroPasso3 } from './AutenticacaoClienteCadastroPasso3';
import { AutenticacaoClienteIndicadorPassosCadastro } from './AutenticacaoClienteIndicadorPassosCadastro';
import type { AutenticacaoClienteCadastroState, AutenticacaoClienteDominios } from './autenticacaoClienteTypes';

type Props = {
  registerState: AutenticacaoClienteCadastroState;
  dominios: AutenticacaoClienteDominios;
};

export const AutenticacaoClienteWizardCadastro = ({ registerState, dominios }: Props) => (
  <>
    <h2 className={styles['register-title']}>Criar Conta</h2>

    <AutenticacaoClienteIndicadorPassosCadastro registerState={registerState} />

    {registerState.regError && (
      <p className={styles['auth-message-error']}>{registerState.regError}</p>
    )}

    {registerState.regSuccess && (
      <p data-cy="register-success-message" className={styles['auth-message-success']}>{registerState.regSuccess}</p>
    )}

    {registerState.regStep === 1 && (
      <AutenticacaoClienteCadastroPasso1 registerState={registerState} dominios={dominios} />
    )}

    {registerState.regStep === 2 && <AutenticacaoClienteCadastroPasso2 registerState={registerState} />}

    {registerState.regStep === 3 && <AutenticacaoClienteCadastroPasso3 registerState={registerState} />}
  </>
);
