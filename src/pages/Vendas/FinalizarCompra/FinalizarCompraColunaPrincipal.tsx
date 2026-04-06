import styles from './FinalizarCompra.module.css';
import { FinalizarCompraEnderecoCard } from './FinalizarCompraEnderecoCard';
import { FinalizarCompraFreteCard } from './FinalizarCompraFreteCard';
import { FinalizarCompraPagamentoCard } from './FinalizarCompraPagamentoCard';
import type { ICheckoutInfo } from '@/interfaces/checkout';
import type { FreteCalculoEntregaApi } from '@/components/FinalizarCompra/Entrega';
import type { ICartaoCreditoInput, ICupomAplicado } from '@/interfaces/pagamento';
import type { IFreteOpcao } from '@/interfaces/pagamento';
import type { LinhaPagamentoCheckout } from '@/types/checkout';

type Props = {
  data: ICheckoutInfo;
  enderecoSelecionado: string | null;
  onSelectEndereco: (uuid: string | null) => void;
  entregaParaFreteCalculo: FreteCalculoEntregaApi;
  freteSelecionado: IFreteOpcao | null;
  onFreteSelecionado: (frete: IFreteOpcao) => void;
  subtotal: number;
  total: number;
  cuponsAplicados: ICupomAplicado[];
  linhasPagamento: LinhaPagamentoCheckout[];
  novosCartoesPorLinha: Record<string, ICartaoCreditoInput>;
  onLinhasChange: (linhas: LinhaPagamentoCheckout[]) => void;
  onAbrirModalCartao: (linhaId: string) => void;
  onSelecionarCartaoSalvoNaLista: (uuid: string) => void;
  onAplicarCupom: (cupom: ICupomAplicado) => void;
  onRemoverCupom: (uuid: string) => void;
  /** CEP da cotação reutilizada do carrinho */
  freteInitialCep?: string;
};

export const FinalizarCompraColunaPrincipal = (p: Props) => (
  <div className={styles['coluna-principal']}>
    <FinalizarCompraEnderecoCard
      data={p.data}
      enderecoSelecionado={p.enderecoSelecionado}
      onSelectEndereco={p.onSelectEndereco}
    />
    <FinalizarCompraFreteCard
      entregaParaFreteCalculo={p.entregaParaFreteCalculo}
      freteSelecionado={p.freteSelecionado}
      onFreteSelecionado={p.onFreteSelecionado}
      subtotal={p.subtotal}
      initialCep={p.freteInitialCep}
    />
    <FinalizarCompraPagamentoCard
      data={p.data}
      total={p.total}
      cuponsAplicados={p.cuponsAplicados}
      linhasPagamento={p.linhasPagamento}
      novosCartoesPorLinha={p.novosCartoesPorLinha}
      onLinhasChange={p.onLinhasChange}
      onAbrirModalCartao={p.onAbrirModalCartao}
      onSelecionarCartaoSalvoNaLista={p.onSelecionarCartaoSalvoNaLista}
      onAplicarCupom={p.onAplicarCupom}
      onRemoverCupom={p.onRemoverCupom}
    />
  </div>
);
