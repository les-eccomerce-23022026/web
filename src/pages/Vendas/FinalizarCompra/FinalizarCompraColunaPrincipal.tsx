import styles from './FinalizarCompra.module.css';
import { FinalizarCompraEnderecoCard } from './FinalizarCompraEnderecoCard';
import { FinalizarCompraFreteCard } from './FinalizarCompraFreteCard';
import { FinalizarCompraPagamentoCard } from './FinalizarCompraPagamentoCard';
import type { ICheckoutInfo } from '@/interfaces/checkout';
import type { FreteCalculoEntregaApi } from '@/components/FinalizarCompra/Entrega';
import type { ICartaoCreditoInput, ICupomAplicado } from '@/interfaces/pagamento';
import type { IFreteOpcao } from '@/interfaces/pagamento';

type Props = {
  data: ICheckoutInfo;
  enderecoSelecionado: string | null;
  onSelectEndereco: (uuid: string | null) => void;
  entregaParaFreteCalculo: FreteCalculoEntregaApi;
  freteSelecionado: IFreteOpcao | null;
  onFreteSelecionado: (frete: IFreteOpcao) => void;
  subtotal: number;
  cartaoSelecionado: string | null;
  novoCartao: ICartaoCreditoInput | null;
  total: number;
  valorPagoParcialmente: number;
  pagamentosParciais: { cartaoUuid: string; valor: number }[];
  cuponsAplicados: ICupomAplicado[];
  onCartaoSelecionado: (uuid: string) => void;
  onNovoCartaoLimpar: () => void;
  onAbrirNovoCartao: () => void;
  onAdicionarPagamentoParcial: (cartaoUuid: string, valor: number) => boolean;
  onRemoverPagamentoParcial: (index: number) => void;
  onAplicarCupom: (cupom: ICupomAplicado) => void;
  onRemoverCupom: (uuid: string) => void;
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
    />
    <FinalizarCompraPagamentoCard
      data={p.data}
      cartaoSelecionado={p.cartaoSelecionado}
      novoCartao={p.novoCartao}
      total={p.total}
      valorPagoParcialmente={p.valorPagoParcialmente}
      pagamentosParciais={p.pagamentosParciais}
      cuponsAplicados={p.cuponsAplicados}
      onCartaoSelecionado={p.onCartaoSelecionado}
      onNovoCartaoLimpar={p.onNovoCartaoLimpar}
      onAbrirNovoCartao={p.onAbrirNovoCartao}
      onAdicionarPagamentoParcial={p.onAdicionarPagamentoParcial}
      onRemoverPagamentoParcial={p.onRemoverPagamentoParcial}
      onAplicarCupom={p.onAplicarCupom}
      onRemoverCupom={p.onRemoverCupom}
    />
  </div>
);
