import { useState, useEffect, useCallback } from 'react';
import styles from './FinalizarCompra.module.css';
import { CartaoCreditoForm } from '@/components/FinalizarCompra/Pagamento';
import { Modal } from '@/components/Comum/Modal';
import { EnderecoForm } from '@/components/Cliente/EnderecoForm';
import { ClienteService } from '@/services/clienteService';
import type { ICartaoCreditoInput, ICupomAplicado, IEnderecoCliente } from '@/interfaces/pagamento';
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
import type { useFinalizarCompra } from '@/hooks/useFinalizarCompra';

type Props = {
  data: ICheckoutInfo;
  hook: ReturnType<typeof useFinalizarCompra>;
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
    recarregar,
  } = hook;

  const [novosCartoesPorLinha, setNovosCartoesPorLinha] = useState<Record<string, ICartaoCreditoInput>>({});
  const [linhaModalCartaoId, setLinhaModalCartaoId] = useState<string | null>(null);

  // Estados para Modal de Endereço
  const [isEnderecoModalOpen, setIsEnderecoModalOpen] = useState(false);
  const [enderecoEditandoUuid, setEnderecoEditandoUuid] = useState<string | null>(null);
  const [isSalvandoEndereco, setIsSalvandoEndereco] = useState(false);

  const resumoFinanceiro = calcularResumoPedidoFinalizarCompra(carrinho, data, freteSelecionado, cuponsAplicados, []);
  
  const {
    composicaoPagamento,
    isSaldoCoberto,
    atualizarMeio,
    adicionarMeioPagamento,
    removerMeioPagamento,
  } = useOrquestradorFinalizacao({
    dadosCheckout: data,
    resumoFinanceiro: resumoFinanceiro
  });
  const parcelasLiquidadas = montarParcelasLiquidadasDasLinhasCheckout(composicaoPagamento);

  // Sincroniza as parcelas para o hook de API (Necessário para o contrato de backend)
  useEffect(() => {
    try {
      definirParcelasLiquidacao(parcelasLiquidadas);
    } catch { /* noop */ }
  }, [parcelasLiquidadas, definirParcelasLiquidacao]);

  const enderecoParaFinalizacao = enderecoFinalizarCompraDerivado(data, enderecoSelecionado);

  const temFormaPagamentoValida = temFormaPagamentoFinalizarCompra(
    cuponsAplicados.length,
    parcelasLiquidadas,
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

  const aoAbrirModalEndereco = useCallback((uuid?: string) => {
    setEnderecoEditandoUuid(uuid || null);
    setIsEnderecoModalOpen(true);
  }, []);

  const aoSalvarEndereco = async (dados: Omit<IEnderecoCliente, 'uuid'>) => {
    setIsSalvandoEndereco(true);
    try {
      let novaLista: IEnderecoCliente[];
      if (enderecoEditandoUuid) {
        novaLista = await ClienteService.editarEndereco(enderecoEditandoUuid, dados);
      } else {
        novaLista = await ClienteService.adicionarEndereco(dados);
      }

      // Identifica o UUID do endereço salvo (se for novo, é o que não estava na lista anterior)
      const anteriorUuids = new Set((data.enderecosDisponiveis || []).map(e => e.uuid));
      const novoOuEditado = novaLista.find(e => !anteriorUuids.has(e.uuid)) || 
                           novaLista.find(e => e.uuid === enderecoEditandoUuid);

      await recarregar();

      if (novoOuEditado) {
        setEnderecoSelecionado(novoOuEditado.uuid);
      }

      setIsEnderecoModalOpen(false);
      setEnderecoEditandoUuid(null);
    } catch {
      alert('Erro ao salvar endereço. Por favor, tente novamente.');
    } finally {
      setIsSalvandoEndereco(false);
    }
  };

  const enderecoEditando = enderecoEditandoUuid 
    ? data.enderecosDisponiveis?.find(e => e.uuid === enderecoEditandoUuid)
    : undefined;

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
          onAdicionarMeio={adicionarMeioPagamento}
          onRemoverMeio={removerMeioPagamento}
          onAtualizarMeio={atualizarMeio}
          onAbrirModalCartao={setLinhaModalCartaoId}
          onSelecionarCartaoSalvoNaLista={(uuid) => atualizarMeio(composicaoPagamento[0].id, { cartaoSalvoUuid: uuid, tipo: 'cartao_salvo' })}
          onAplicarCupom={(c: ICupomAplicado) => aplicarCupom({ uuid: c.uuid, codigo: c.codigo, tipo: c.tipo, valor: c.valor })}
          onRemoverCupom={removerCupom}
          onAddEndereco={() => aoAbrirModalEndereco()}
          onEditEndereco={(uuid) => aoAbrirModalEndereco(uuid)}
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

      <Modal 
        isOpen={isEnderecoModalOpen} 
        onClose={() => setIsEnderecoModalOpen(false)} 
        title={enderecoEditandoUuid ? 'Editar Endereço' : 'Adicionar Novo Endereço'}
      >
        <EnderecoForm
          initialData={enderecoEditando}
          onSubmit={aoSalvarEndereco}
          onCancel={() => setIsEnderecoModalOpen(false)}
          isLoading={isSalvandoEndereco}
        />
      </Modal>
    </div>
  );
};
