import styles from './Checkout.module.css';
import { CheckoutEnderecoCard } from './CheckoutEnderecoCard';
import { CheckoutFreteCard } from './CheckoutFreteCard';
import { CheckoutPagamentoCard } from './CheckoutPagamentoCard';
import type { ICheckoutInfo } from '@/interfaces/ICheckout';
import type { FreteCalculoEntregaApi } from '@/components/checkout/entrega';
import type { ICartaoCreditoInput, ICupomAplicado } from '@/interfaces/IPagamento';
import type { IFreteOpcao } from '@/interfaces/IPagamento';

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

export const CheckoutColunaPrincipal = (p: Props) => (
  <div className={styles['coluna-principal']}>
    <CheckoutEnderecoCard
      data={p.data}
      enderecoSelecionado={p.enderecoSelecionado}
      onSelectEndereco={p.onSelectEndereco}
    />
    <CheckoutFreteCard
      entregaParaFreteCalculo={p.entregaParaFreteCalculo}
      freteSelecionado={p.freteSelecionado}
      onFreteSelecionado={p.onFreteSelecionado}
      subtotal={p.subtotal}
    />
    <CheckoutPagamentoCard
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
