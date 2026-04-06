import styles from './FinalizarCompra.module.css';
import { FinalizarCompraResumoPedidoLista } from './FinalizarCompraResumoPedidoLista';
import { FinalizarCompraResumoPedidoAcoes } from './FinalizarCompraResumoPedidoAcoes';

type Props = {
  quantidadeItens: number;
  subtotal: number;
  frete: number;
  descontoCupons: number;
  valorPagoParcialmente: number;
  totalMenosParcial: number;
  finalizando: boolean;
  enderecoOk: boolean;
  freteSelecionado: boolean;
  temFormaPagamento: boolean;
  saldoPagamentoOk: boolean;
  onFinalizar: () => void;
};

export const FinalizarCompraResumoPedido = (props: Props) => (
  <div className={styles['coluna-lateral']}>
    <div className={`card ${styles['checkout-summary-card']}`}>
      <h3 className={styles['checkout-summary-title']}>Resumo do Pedido</h3>
      <FinalizarCompraResumoPedidoLista
        quantidadeItens={props.quantidadeItens}
        subtotal={props.subtotal}
        frete={props.frete}
        descontoCupons={props.descontoCupons}
        valorPagoParcialmente={props.valorPagoParcialmente}
      />
      <FinalizarCompraResumoPedidoAcoes
        totalMenosParcial={props.totalMenosParcial}
        finalizando={props.finalizando}
        enderecoOk={props.enderecoOk}
        freteSelecionado={props.freteSelecionado}
        temFormaPagamento={props.temFormaPagamento}
        saldoPagamentoOk={props.saldoPagamentoOk}
        onFinalizar={props.onFinalizar}
      />
    </div>
  </div>
);
