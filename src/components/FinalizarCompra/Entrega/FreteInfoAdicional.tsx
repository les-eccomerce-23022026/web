import type { IFreteCalculoOutput } from '@/interfaces/entrega';
import styles from './FreteCalculo.style.module.css';

interface FreteInfoAdicionalProps {
  freteCalculado: IFreteCalculoOutput;
}

export const FreteInfoAdicional = ({ freteCalculado }: FreteInfoAdicionalProps) => {
  return (
    <div className={styles['frete-info-adicional']}>
      <p>
        <strong>CEP de Origem:</strong> {freteCalculado.cepOrigem}
      </p>
      {freteCalculado.pesoTotal && (
        <p>
          <strong>Peso Total:</strong> {freteCalculado.pesoTotal} kg
        </p>
      )}
    </div>
  );
};
