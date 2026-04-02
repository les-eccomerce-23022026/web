import styles from './LoginArea.module.css';
import { LoginRegisterStep1 } from './LoginRegisterStep1';
import { LoginRegisterStep2 } from './LoginRegisterStep2';
import { LoginRegisterStepper } from './LoginRegisterStepper';
import type { LoginAreaRegisterState, LoginAreaDominios } from './loginAreaTypes';

type Props = {
  registerState: LoginAreaRegisterState;
  dominios: LoginAreaDominios;
};

export const LoginRegisterWizard = ({ registerState, dominios }: Props) => (
  <>
    <h2 className={styles['register-title']}>Criar Conta</h2>

    <LoginRegisterStepper registerState={registerState} />

    {registerState.regError && (
      <p className={styles['auth-message-error']}>{registerState.regError}</p>
    )}

    {registerState.regStep === 1 && (
      <LoginRegisterStep1 registerState={registerState} dominios={dominios} />
    )}

    {registerState.regStep === 2 && <LoginRegisterStep2 registerState={registerState} />}
  </>
);
