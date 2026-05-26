import type { IFreteCalculoOutput, IFreteOpcao } from '@/interfaces/entrega';
import { FreteOpcaoItem } from './FreteOpcaoItem';
import styles from './FreteCalculo.style.module.css';

interface FreteOpcoesListaProps {
  freteCalculado: IFreteCalculoOutput;
  freteSelecionado?: IFreteOpcao | null;
  onSelecionar: (opcao: IFreteOpcao) => void;
}

export const FreteOpcoesLista = ({
  freteCalculado,
  freteSelecionado,
  onSelecionar
}: FreteOpcoesListaProps) => {
  return (
    <div className={styles['opcoes-frete']} data-cy="checkout-freight-options">
      <p className={styles['opcoes-titulo']}>Opções de frete disponíveis:</p>

      {freteCalculado.opcoes.map((opcao) => (
        <FreteOpcaoItem
          key={opcao.uuid}
          opcao={opcao}
          selecionado={freteSelecionado?.uuid === opcao.uuid}
          onSelecionar={onSelecionar}
        />
      ))}
    </div>
  );
};
