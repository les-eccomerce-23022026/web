import styles from './Checkout.module.css';
import { CartaoCreditoForm } from '@/components/checkout/pagamento';
import { Modal } from '@/components/comum/Modal';
import type { ICartaoCreditoInput, ICupomAplicado } from '@/interfaces/IPagamento';
import { CheckoutResumoPedido } from './CheckoutResumoPedido';
import { CheckoutColunaPrincipal } from './CheckoutColunaPrincipal';
import {
  calcularResumoPedidoCheckout,
  enderecoParaCheckoutDerivado,
  temFormaPagamentoCheckout,
} from './checkoutPedidoDerivados';
import type { useCheckout } from '@/hooks/useCheckout';
import type { ICarrinho } from '@/interfaces/ICarrinho';
import type { ICheckoutInfo } from '@/interfaces/ICheckout';

type Hook = ReturnType<typeof useCheckout>;

type Props = {
  data: ICheckoutInfo;
  hook: Hook;
  carrinho: ICarrinho | null | undefined;
  mostrarNovoCartao: boolean;
  setMostrarNovoCartao: (v: boolean) => void;
  cartaoSelecionado: string | null;
  setCartaoSelecionado: (v: string | null) => void;
  novoCartao: ICartaoCreditoInput | null;
  setNovoCartao: (v: ICartaoCreditoInput | null) => void;
  enderecoSelecionado: string | null;
  setEnderecoSelecionado: (v: string | null) => void;
};

export const CheckoutPedidoCarregado = ({
  data,
  hook,
  carrinho,
  mostrarNovoCartao,
  setMostrarNovoCartao,
  cartaoSelecionado,
  setCartaoSelecionado,
  novoCartao,
  setNovoCartao,
  enderecoSelecionado,
  setEnderecoSelecionado,
}: Props) => {
  const {
    finalizando,
    handleFinalizarCompra,
    cuponsAplicados,
    aplicarCupom,
    removerCupom,
    pagamentosParciais,
    adicionarPagamentoParcial,
    removerPagamentoParcial,
    freteSelecionado,
    selecionarFrete,
    entregaParaFreteCalculo,
  } = hook;

  const enderecoParaCheckout = enderecoParaCheckoutDerivado(data, enderecoSelecionado);
  const resumo = calcularResumoPedidoCheckout(
    carrinho,
    data,
    freteSelecionado,
    cuponsAplicados,
    pagamentosParciais,
  );

  const temFormaPagamento = temFormaPagamentoCheckout(
    cuponsAplicados.length,
    pagamentosParciais.length,
    cartaoSelecionado,
    novoCartao,
  );

  const handleAplicarCupom = (cupom: ICupomAplicado) => {
    aplicarCupom({
      uuid: cupom.uuid,
      codigo: cupom.codigo,
      tipo: cupom.tipo,
      valor: cupom.valor,
    });
  };

  const handleCartaoSelecionado = (uuid: string) => {
    setCartaoSelecionado(uuid);
    setNovoCartao(null);
  };

  const handleNovoCartao = (dados: ICartaoCreditoInput) => {
    setNovoCartao(dados);
    setCartaoSelecionado(null);
    setMostrarNovoCartao(false);
  };

  return (
    <div className={styles['checkout-page']}>
      <h1 className="page-title">Finalizar Compra</h1>
      <div className={`breadcrumb ${styles['checkout-breadcrumb']}`}>
        <strong>1. Identificação</strong> &gt; <strong>2. Entrega</strong> &gt;{' '}
        <span className={styles['checkout-breadcrumb-active']}>3. Pagamento</span>
      </div>

      <div className={styles['checkout-grid']}>
        <CheckoutColunaPrincipal
          data={data}
          enderecoSelecionado={enderecoSelecionado}
          onSelectEndereco={setEnderecoSelecionado}
          entregaParaFreteCalculo={entregaParaFreteCalculo}
          freteSelecionado={freteSelecionado}
          onFreteSelecionado={selecionarFrete}
          subtotal={resumo.subtotal}
          cartaoSelecionado={cartaoSelecionado}
          novoCartao={novoCartao}
          total={resumo.total}
          valorPagoParcialmente={resumo.valorPagoParcialmente}
          pagamentosParciais={pagamentosParciais}
          cuponsAplicados={cuponsAplicados}
          onCartaoSelecionado={handleCartaoSelecionado}
          onNovoCartaoLimpar={() => setNovoCartao(null)}
          onAbrirNovoCartao={() => setMostrarNovoCartao(true)}
          onAdicionarPagamentoParcial={adicionarPagamentoParcial}
          onRemoverPagamentoParcial={removerPagamentoParcial}
          onAplicarCupom={handleAplicarCupom}
          onRemoverCupom={removerCupom}
        />

        <CheckoutResumoPedido
          quantidadeItens={resumo.quantidadeItens}
          subtotal={resumo.subtotal}
          frete={resumo.frete}
          descontoCupons={resumo.descontoCupons}
          valorPagoParcialmente={resumo.valorPagoParcialmente}
          totalMenosParcial={resumo.total - resumo.valorPagoParcialmente}
          finalizando={finalizando}
          enderecoOk={Boolean(enderecoParaCheckout)}
          freteSelecionado={Boolean(freteSelecionado)}
          temFormaPagamento={temFormaPagamento}
          onFinalizar={() =>
            void handleFinalizarCompra({
              cartaoSalvoUuid: cartaoSelecionado,
              novoCartao: novoCartao ?? undefined,
            })
          }
        />
      </div>

      <Modal
        isOpen={mostrarNovoCartao}
        onClose={() => setMostrarNovoCartao(false)}
        title="Adicionar Novo Cartão"
      >
        <CartaoCreditoForm
          bandeirasPermitidas={data.bandeirasPermitidas}
          onSubmit={handleNovoCartao}
          onCancel={() => setMostrarNovoCartao(false)}
        />
      </Modal>
    </div>
  );
};
