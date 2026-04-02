import styles from './FinalizarCompra.module.css';
import { FreteCalculo } from '@/components/FinalizarCompra/Entrega';
import type { FreteCalculoEntregaApi } from '@/components/FinalizarCompra/Entrega';
import type { IFreteOpcao } from '@/interfaces/pagamento';

type Props = {
  entregaParaFreteCalculo: FreteCalculoEntregaApi;
  freteSelecionado: IFreteOpcao | null;
  onFreteSelecionado: (frete: IFreteOpcao) => void;
  subtotal: number;
};

export const FinalizarCompraFreteCard = ({
  entregaParaFreteCalculo,
  freteSelecionado,
  onFreteSelecionado,
  subtotal,
}: Props) => (
  <div className={`card ${styles['checkout-card-spaced']}`}>
    <h3 className={styles['checkout-section-title']}>Frete</h3>
    <FreteCalculo
      entrega={entregaParaFreteCalculo}
      onFreteSelecionado={onFreteSelecionado}
      freteSelecionado={freteSelecionado}
      pesoTotal={1}
      valorTotal={subtotal}
    />
    {freteSelecionado && (
      <p className={styles['frete-selecionado-info']}>
        ✓ Frete {freteSelecionado.tipo} selecionado: {'R$ '}
        {freteSelecionado.valor.toFixed(2).replace('.', ',')} — {freteSelecionado.prazo}
      </p>
    )}
  </div>
);
