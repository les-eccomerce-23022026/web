import styles from './LoginArea.module.css';
import { LoginRegisterPromo } from './LoginRegisterPromo';
import { LoginRegisterWizard } from './LoginRegisterWizard';
import type { LoginAreaRegisterState, LoginAreaDominios } from './loginAreaTypes';

type Props = {
  registerState: LoginAreaRegisterState;
  dominios: LoginAreaDominios;
};

export const LoginAreaRegisterPanel = ({ registerState, dominios }: Props) => (
  <div className={`card ${styles['register-box-card']}`}>
    {!registerState.showRegister ? (
      <LoginRegisterPromo registerState={registerState} />
    ) : (
      <LoginRegisterWizard registerState={registerState} dominios={dominios} />
    )}
  </div>
);
