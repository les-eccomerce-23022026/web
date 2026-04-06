import styles from './FinalizarCompra.module.css';
import { CartaoCreditoForm } from '@/components/FinalizarCompra/Pagamento';
import { Modal } from '@/components/Comum/Modal';
import type { ICartaoCreditoInput, ICupomAplicado } from '@/interfaces/pagamento';
import { FinalizarCompraResumoPedido } from './FinalizarCompraResumoPedido';
import { FinalizarCompraColunaPrincipal } from './FinalizarCompraColunaPrincipal';
import {
  calcularResumoPedidoFinalizarCompra,
  enderecoEntregaInputDeCheckout,
  enderecoFinalizarCompraDerivado,
  pagamentoCobreSaldoFinalizarCompra,
  temFormaPagamentoFinalizarCompra,
} from './finalizarCompraPedidoDerivados';
import { useFinalizarCompra } from '@/hooks/useFinalizarCompra';
import type { ICarrinho } from '@/interfaces/carrinho';
import type { ICheckoutInfo } from '@/interfaces/checkout';

type Hook = ReturnType<typeof useFinalizarCompra>;

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

export const FinalizarCompraPedidoCarregado = ({
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

  const enderecoParaFinalizarCompra = enderecoFinalizarCompraDerivado(data, enderecoSelecionado);
  const resumo = calcularResumoPedidoFinalizarCompra(
    carrinho,
    data,
    freteSelecionado,
    cuponsAplicados,
    pagamentosParciais,
  );

  const temFormaPagamento = temFormaPagamentoFinalizarCompra(
    cuponsAplicados.length,
    pagamentosParciais.length,
    cartaoSelecionado,
    novoCartao,
  );

  const saldoPagamentoOk = pagamentoCobreSaldoFinalizarCompra(
    resumo.total,
    pagamentosParciais,
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
        <FinalizarCompraColunaPrincipal
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

        <FinalizarCompraResumoPedido
          quantidadeItens={resumo.quantidadeItens}
          subtotal={resumo.subtotal}
          frete={resumo.frete}
          descontoCupons={resumo.descontoCupons}
          valorPagoParcialmente={resumo.valorPagoParcialmente}
          totalMenosParcial={resumo.total - resumo.valorPagoParcialmente}
          finalizando={finalizando}
          enderecoOk={Boolean(enderecoParaFinalizarCompra)}
          freteSelecionado={Boolean(freteSelecionado)}
          temFormaPagamento={temFormaPagamento}
          saldoPagamentoOk={saldoPagamentoOk}
          onFinalizar={() =>
            void handleFinalizarCompra({
              cartaoSalvoUuid: cartaoSelecionado,
              novoCartao: novoCartao ?? undefined,
              enderecoEntrega: enderecoEntregaInputDeCheckout(data, enderecoSelecionado) ?? undefined,
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
          salvarCartao
          dicaSalvarCartaoOpcional="Com esta opção marcada, o cartão é gravado no seu perfil após você concluir o pedido (não ao clicar em Adicionar cartão)."
        />
      </Modal>
    </div>
  );
};
