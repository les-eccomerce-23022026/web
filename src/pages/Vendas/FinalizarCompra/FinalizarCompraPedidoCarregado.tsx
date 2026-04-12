import { useState, useEffect, useCallback } from 'react';
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
  temFormaPagamentoFinalizarCompra,
} from './finalizarCompraCalculos';
import type { ICarrinho } from '@/interfaces/carrinho';
import type { ICheckoutInfo } from '@/interfaces/checkout';
import { montarParcelasLiquidadasDasLinhasCheckout } from '@/utils/finalizarCompraLinhasPagamento';
import { useOrquestradorFinalizacao } from './useOrquestradorFinalizacao';

type Props = {
  data: ICheckoutInfo;
  hook: any;
  carrinho: ICarrinho | null | undefined;
  enderecoSelecionado: string | null;
  setEnderecoSelecionado: (v: string | null) => void;
};

/**
 * Componente que orquestra a etapa final da compra (Mesa de Pagamento e Resumo).
 * Aplicando SRP e Linguagem Ubíqua para reduzir complexidade.
 */
export const FinalizarCompraPedidoCarregado = ({
  data,
  hook,
  carrinho,
  enderecoSelecionado,
  setEnderecoSelecionado,
}: Props) => {
  const {
    isFinalizando,
    handleFinalizarCompra,
    cuponsAplicados,
    aplicarCupom,
    removerCupom,
    definirParcelasLiquidacao,
    freteSelecionado,
    selecionarFrete,
    entregaParaFreteCalculo,
    cepDestinoFrete,
  } = hook;

  const [novosCartoesPorLinha, setNovosCartoesPorLinha] = useState<Record<string, ICartaoCreditoInput>>({});
  const [linhaModalCartaoId, setLinhaModalCartaoId] = useState<string | null>(null);

  const resumoFinanceiro = calcularResumoPedidoFinalizarCompra(carrinho, data, freteSelecionado, cuponsAplicados, []);
  
  const {
    composicaoPagamento,
    isSaldoCoberto,
    atualizarMeio,
    adicionarMeioPagamento,
    removerMeioPagamento
  } = useOrquestradorFinalizacao({
    dadosCheckout: data,
    resumoFinanceiro: resumoFinanceiro
  });

  // Sincroniza as parcelas para o hook de API (Necessário para o contrato de backend)
  useEffect(() => {
    try {
      definirParcelasLiquidacao(montarParcelasLiquidadasDasLinhasCheckout(composicaoPagamento));
    } catch { /* noop */ }
  }, [composicaoPagamento, definirParcelasLiquidacao]);

  const enderecoParaFinalizacao = enderecoFinalizarCompraDerivado(data, enderecoSelecionado);

  const temFormaPagamentoValida = temFormaPagamentoFinalizarCompra(
    cuponsAplicados.length,
    composicaoPagamento.map(l => ({ valor: l.valor, parcelas: l.parcelasCartao })),
    novosCartoesPorLinha,
    null,
    null
  ) && isSaldoCoberto;

  const aoFinalizar = () => {
    void handleFinalizarCompra({
      novosCartoesPorLinha: Object.keys(novosCartoesPorLinha).length > 0 ? novosCartoesPorLinha : undefined,
      enderecoEntrega: enderecoEntregaInputDeCheckout(data, enderecoSelecionado) ?? undefined,
    });
  };

  const aoSalvarNovoCartao = (dados: ICartaoCreditoInput) => {
    if (linhaModalCartaoId) {
      setNovosCartoesPorLinha(prev => ({ ...prev, [linhaModalCartaoId]: dados }));
      setLinhaModalCartaoId(null);
    }
  };

  return (
    <div className={styles['checkout-page']}>
      <h1 className="page-title">Finalizar Compra</h1>
      <div className={`breadcrumb ${styles['checkout-breadcrumb']}`}>
        <strong>1. Identificação</strong> &gt; <strong>2. Entrega</strong> &gt; <span className={styles['checkout-breadcrumb-active']}>3. Pagamento</span>
      </div>

      <div className={styles['checkout-grid']}>
        <FinalizarCompraColunaPrincipal
          data={data}
          enderecoSelecionado={enderecoSelecionado}
          onSelectEndereco={setEnderecoSelecionado}
          entregaParaFreteCalculo={entregaParaFreteCalculo}
          freteSelecionado={freteSelecionado}
          onFreteSelecionado={selecionarFrete}
          subtotal={resumoFinanceiro.subtotal}
          freteInitialCep={cepDestinoFrete || undefined}
          total={resumoFinanceiro.total}
          cuponsAplicados={cuponsAplicados}
          linhasPagamento={composicaoPagamento}
          novosCartoesPorLinha={novosCartoesPorLinha}
          onLinhasChange={(nova) => { /* useOrquestrador gerencia internamente, mas mantemos interface */ }}
          onAbrirModalCartao={setLinhaModalCartaoId}
          onAplicarCupom={(c: ICupomAplicado) => aplicarCupom({ uuid: c.uuid, codigo: c.codigo, tipo: c.tipo, valor: c.valor })}
          onRemoverCupom={removerCupom}
        />

        <FinalizarCompraResumoPedido
          quantidadeItens={resumoFinanceiro.quantidadeItens}
          subtotal={resumoFinanceiro.subtotal}
          frete={resumoFinanceiro.frete}
          descontoCupons={resumoFinanceiro.descontoCupons}
          valorPagoParcialmente={0}
          totalMenosParcial={resumoFinanceiro.total}
          finalizando={isFinalizando}
          enderecoOk={Boolean(enderecoParaFinalizacao)}
          freteSelecionado={Boolean(freteSelecionado)}
          temFormaPagamento={temFormaPagamentoValida}
          saldoPagamentoOk={isSaldoCoberto}
          onFinalizar={aoFinalizar}
        />
      </div>

      <Modal isOpen={linhaModalCartaoId !== null} onClose={() => setLinhaModalCartaoId(null)} title="Adicionar Novo Cartão">
        <CartaoCreditoForm
          bandeirasPermitidas={data.bandeirasPermitidas}
          onSubmit={aoSalvarNovoCartao}
          onCancel={() => setLinhaModalCartaoId(null)}
          salvarCartao
        />
      </Modal>
    </div>
  );
};
