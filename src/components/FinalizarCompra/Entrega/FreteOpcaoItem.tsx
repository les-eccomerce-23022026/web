import type { IFreteOpcao } from '@/interfaces/entrega';
import { Check } from 'lucide-react';
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
      role="radio"
      aria-checked={selecionado}
      aria-label={`Opção de frete ${opcao.tipo}, prazo ${opcao.prazo}, valor ${opcao.valor === 0 ? 'grátis' : formatarValorFrete(opcao.valor)}. ${selecionado ? 'Selecionado' : 'Não selecionado'}`}
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

        {selecionado && (
          <div className={styles['check-indicator']} aria-hidden="true">
            <Check size={20} strokeWidth={2.5} />
          </div>
        )}
      </div>
    </div>
  );
};
