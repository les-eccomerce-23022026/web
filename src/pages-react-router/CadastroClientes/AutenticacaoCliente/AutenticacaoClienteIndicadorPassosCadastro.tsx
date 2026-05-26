import styles from './style.module.css';
import type { AutenticacaoClienteCadastroState } from './autenticacaoClienteTypes';

type Props = {
  registerState: AutenticacaoClienteCadastroState;
};

export const AutenticacaoClienteIndicadorPassosCadastro = ({ registerState }: Props) => {
  const totalPassos = registerState.regQuerSerAdmin ? 3 : 2;

  return (
    <div className={styles.stepper}>
      <div
        className={`${styles.stepperItem} ${registerState.regStep >= 1 ? styles.stepperItemActive : ''}`}
      >
        <span className={styles.stepperNumber}>1</span>
        <span className={styles.stepperLabel}>Dados Básicos</span>
      </div>
      <div className={styles.stepperDivider} />
      <div
        className={`${styles.stepperItem} ${registerState.regStep >= 2 ? styles.stepperItemActive : ''}`}
      >
        <span className={styles.stepperNumber}>2</span>
        <span className={styles.stepperLabel}>Contato e Senha</span>
      </div>
      {totalPassos === 3 && (
        <>
          <div className={styles.stepperDivider} />
          <div
            className={`${styles.stepperItem} ${registerState.regStep >= 3 ? styles.stepperItemActive : ''}`}
          >
            <span className={styles.stepperNumber}>3</span>
            <span className={styles.stepperLabel}>Dados da Loja</span>
          </div>
        </>
      )}
    </div>
  );
};
