import { useAutenticacaoCliente } from './useAutenticacaoCliente';
import styles from './AutenticacaoCliente.module.css';
import { AutenticacaoClienteLoginCard } from './AutenticacaoClienteLoginCard';
import { AutenticacaoClientePainelCadastro } from './AutenticacaoClientePainelCadastro';

export const AutenticacaoCliente = () => {
  const { loginState, registerState, dominios } = useAutenticacaoCliente();

  return (
    <div className={styles['auth-page']}>
      <AutenticacaoClienteLoginCard loginState={loginState} />
      <AutenticacaoClientePainelCadastro registerState={registerState} dominios={dominios} />
    </div>
  );
};
