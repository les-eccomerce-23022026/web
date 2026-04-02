import { useLoginArea } from './useLoginArea';
import styles from './LoginArea.module.css';
import { LoginAreaLoginCard } from './LoginAreaLoginCard';
import { LoginAreaRegisterPanel } from './LoginAreaRegisterPanel';

export const LoginArea = () => {
  const { loginState, registerState, dominios } = useLoginArea();

  return (
    <div className={styles['auth-page']}>
      <LoginAreaLoginCard loginState={loginState} />
      <LoginAreaRegisterPanel registerState={registerState} dominios={dominios} />
    </div>
  );
};
