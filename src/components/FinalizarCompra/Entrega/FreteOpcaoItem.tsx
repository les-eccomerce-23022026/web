import type { IFreteOpcao } from '@/interfaces/entrega';
import { formatarValorFrete } from './freteCalculoUtils';
import styles from './FreteCalculo.style.module.css';

interface FreteOpcaoItemProps {
  opcao: IFreteOpcao;
  selecionado: boolean;
  onSelecionar: (opcao: IFreteOpcao) => void;
}

export const FreteOpcaoItem = ({ opcao, selecionado, onSelecionar }: FreteOpcaoItemProps) => {
  return (
    <div
      className={`${styles['opcao-frete']} ${selecionado ? styles['selecionado'] : ''}`}
      onClick={() => onSelecionar(opcao)}
      data-cy={`checkout-freight-option-${opcao.tipo}`}
      data-selected={selecionado}
    >
      <div className={styles['opcao-conteudo']}>
        <div className={styles['opcao-tipo']}>
          <span className={styles['tipo-badge']}>{opcao.tipo}</span>
        </div>

        <div className={styles['opcao-info']}>
          <p className={styles['prazo']}>{opcao.prazo}</p>
        </div>

        <div className={styles['opcao-valor']}>
          {opcao.valor === 0 ? (
            <span className={styles['gratis']}>Grátis</span>
          ) : (
            <span>R$ {formatarValorFrete(opcao.valor)}</span>
          )}
        </div>
      </div>
    </div>
  );
};
