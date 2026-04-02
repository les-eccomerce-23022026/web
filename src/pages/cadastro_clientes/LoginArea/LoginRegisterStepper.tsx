import styles from './LoginArea.module.css';
import type { LoginAreaRegisterState } from './loginAreaTypes';

type Props = {
  registerState: LoginAreaRegisterState;
};

export const LoginRegisterStepper = ({ registerState }: Props) => (
  <div className={styles.stepper}>
    <div
      className={`${styles.stepperItem} ${registerState.regStep >= 1 ? styles.stepperItemActive : ''}`}
      onClick={registerState.regStep === 2 ? registerState.handlePrevStep : undefined}
      style={registerState.regStep === 2 ? { cursor: 'pointer' } : undefined}
    >
      <span className={styles.stepperNumber}>1</span>
      <span className={styles.stepperLabel}>Dados Pessoais</span>
    </div>
    <div className={styles.stepperDivider} />
    <div
      className={`${styles.stepperItem} ${registerState.regStep >= 2 ? styles.stepperItemActive : ''}`}
      onClick={registerState.regStep === 1 ? registerState.handleNextStep : undefined}
      style={registerState.regStep === 1 ? { cursor: 'pointer' } : undefined}
    >
      <span className={styles.stepperNumber}>2</span>
      <span className={styles.stepperLabel}>Endereço</span>
    </div>
  </div>
);
