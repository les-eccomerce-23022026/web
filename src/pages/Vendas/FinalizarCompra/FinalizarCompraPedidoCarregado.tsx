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
  pagamentoCobreSaldoFinalizarCompra,
  temFormaPagamentoFinalizarCompra,
} from './finalizarCompraCalculos';
import { useFinalizarCompra } from '@/hooks/useFinalizarCompra';
import type { ICarrinho } from '@/interfaces/carrinho';
import type { ICheckoutInfo } from '@/interfaces/checkout';
import type { LinhaPagamentoCheckout } from '@/types/checkout';
import {
  montarParcelasLiquidadasDasLinhasCheckout,
  validarValorMinimoPorMeioNaDivisaoPagamento,
} from '@/utils/finalizarCompraLinhasPagamento';
import { generateSafeId } from '@/utils/generateId';

type Hook = ReturnType<typeof useFinalizarCompra>;

type Props = {
  data: ICheckoutInfo;
  hook: Hook;
  carrinho: ICarrinho | null | undefined;
  enderecoSelecionado: string | null;
  setEnderecoSelecionado: (v: string | null) => void;
};

export const FinalizarCompraPedidoCarregado = ({
  data,
  hook,
  carrinho,
  enderecoSelecionado,
  setEnderecoSelecionado,
}: Props) => {
  const {
    finalizando,
    handleFinalizarCompra,
    cuponsAplicados,
    aplicarCupom,
    removerCupom,
    parcelasLiquidacao,
    definirParcelasLiquidacao,
    freteSelecionado,
    selecionarFrete,
    entregaParaFreteCalculo,
    cepDestinoFrete,
  } = hook;

  const [linhasPagamento, setLinhasPagamento] = useState<LinhaPagamentoCheckout[]>([]);
  const [novosCartoesPorLinha, setNovosCartoesPorLinha] = useState<Record<string, ICartaoCreditoInput>>({});
  const [linhaModalCartaoId, setLinhaModalCartaoId] = useState<string | null>(null);

  const [prevData, setPrevData] = useState<ICheckoutInfo | null>(null);
  if (data && data !== prevData) {
    setPrevData(data);
    if (linhasPagamento.length === 0) {
      const r = calcularResumoPedidoFinalizarCompra(
        carrinho,
        data,
        freteSelecionado,
        cuponsAplicados,
        [],
      );
      const t = Math.round(r.total * 100) / 100;
      const id = generateSafeId();
      if (data.cartoesSalvos.length > 0) {
        setLinhasPagamento([
          {
            id,
            tipo: 'cartao_salvo',
            cartaoSalvoUuid: data.cartoesSalvos[0].uuid,
            valor: t,
            parcelasCartao: 1,
          },
        ]);
      } else {
        setLinhasPagamento([{ id, tipo: 'cartao_novo', valor: t, parcelasCartao: 1 }]);
      }
    }
  }

  const enderecoParaFinalizarCompra = enderecoFinalizarCompraDerivado(data, enderecoSelecionado);
  const resumo = calcularResumoPedidoFinalizarCompra(
    carrinho,
    data,
    freteSelecionado,
    cuponsAplicados,
    parcelasLiquidacao,
  );

  const [prevResumoTotal, setPrevResumoTotal] = useState(resumo.total);
  if (resumo.total !== prevResumoTotal) {
    setPrevResumoTotal(resumo.total);
    if (linhasPagamento.length === 1) {
      const t = Math.round(resumo.total * 100) / 100;
      setLinhasPagamento([{ ...linhasPagamento[0], valor: t }]);
    }
  }

  const [prevLinhasForNovosCartoes, setPrevLinhasForNovosCartoes] = useState(linhasPagamento);
  if (linhasPagamento !== prevLinhasForNovosCartoes) {
    setPrevLinhasForNovosCartoes(linhasPagamento);
    const ids = new Set(linhasPagamento.filter((l) => l.tipo === 'cartao_novo').map((l) => l.id));
    const hasKeysToRemove = Object.keys(novosCartoesPorLinha).some((k) => !ids.has(k));
    if (hasKeysToRemove) {
      const next = { ...novosCartoesPorLinha };
      for (const k of Object.keys(next)) {
        if (!ids.has(k)) delete next[k];
      }
      setNovosCartoesPorLinha(next);
    }
  }

  useEffect(() => {
    if (linhasPagamento.length === 0) return;
    try {
      definirParcelasLiquidacao(montarParcelasLiquidadasDasLinhasCheckout(linhasPagamento));
    } catch {
      // noop
    }
  }, [linhasPagamento, definirParcelasLiquidacao]);

  const handleLinhasChange = useCallback((nova: LinhaPagamentoCheckout[]) => {
    setLinhasPagamento(nova);
  }, []);

  const handleSelecionarCartaoSalvoNaLista = useCallback((uuid: string) => {
    setLinhasPagamento((prev) => {
      if (prev.length === 0) return prev;
      const first = prev[0];
      if (first.tipo === 'cartao_salvo') {
        return [{ ...first, cartaoSalvoUuid: uuid }, ...prev.slice(1)];
      }
      return [
        { id: first.id, tipo: 'cartao_salvo', cartaoSalvoUuid: uuid, valor: first.valor },
        ...prev.slice(1),
      ];
    });
  }, []);

  const rnOk = validarValorMinimoPorMeioNaDivisaoPagamento(linhasPagamento, resumo.total).ok;

  const temFormaPagamento =
    temFormaPagamentoFinalizarCompra(
      cuponsAplicados.length,
      parcelasLiquidacao,
      novosCartoesPorLinha,
      null,
      null,
    ) && rnOk;

  const saldoPagamentoOk = pagamentoCobreSaldoFinalizarCompra(
    resumo.total,
    parcelasLiquidacao,
    novosCartoesPorLinha,
    null,
    null,
  );

  const handleAplicarCupom = (cupom: ICupomAplicado) => {
    aplicarCupom({
      uuid: cupom.uuid,
      codigo: cupom.codigo,
      tipo: cupom.tipo,
      valor: cupom.valor,
    });
  };

  const handleNovoCartaoModal = (dados: ICartaoCreditoInput) => {
    if (!linhaModalCartaoId) return;
    setNovosCartoesPorLinha((prev) => ({ ...prev, [linhaModalCartaoId]: dados }));
    setLinhaModalCartaoId(null);
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
          freteInitialCep={cepDestinoFrete || undefined}
          total={resumo.total}
          cuponsAplicados={cuponsAplicados}
          linhasPagamento={linhasPagamento}
          novosCartoesPorLinha={novosCartoesPorLinha}
          onLinhasChange={handleLinhasChange}
          onAbrirModalCartao={(id) => setLinhaModalCartaoId(id)}
          onSelecionarCartaoSalvoNaLista={handleSelecionarCartaoSalvoNaLista}
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
              novosCartoesPorLinha:
                Object.keys(novosCartoesPorLinha).length > 0 ? novosCartoesPorLinha : undefined,
              enderecoEntrega: enderecoEntregaInputDeCheckout(data, enderecoSelecionado) ?? undefined,
            })
          }
        />
      </div>

      <Modal
        isOpen={linhaModalCartaoId !== null}
        onClose={() => setLinhaModalCartaoId(null)}
        title="Adicionar Novo Cartão"
      >
        <CartaoCreditoForm
          bandeirasPermitidas={data.bandeirasPermitidas}
          onSubmit={handleNovoCartaoModal}
          onCancel={() => setLinhaModalCartaoId(null)}
          salvarCartao
          dicaSalvarCartaoOpcional="Com esta opção marcada, o cartão é gravado no seu perfil após você concluir o pedido (não ao clicar em Adicionar cartão)."
        />
      </Modal>
    </div>
  );
};
