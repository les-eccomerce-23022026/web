import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutService } from '@/services/CheckoutService';
import { PagamentoServiceApi } from '@/services/api/PagamentoServiceApi';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { limparCarrinho } from '@/store/slices/carrinhoSlice';
import type { ICheckoutInfo } from '@/interfaces/ICheckout';
import type { IVendaResultado } from '@/services/contracts/ICheckoutService';
import { usePagamento } from './usePagamento';

/**
 * Hook atualizado para checkout com integração real de pagamento
 * Sprint 2 - User Story 3 e 4
 */
export function useCheckout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [data, setData] = useState<ICheckoutInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [finalizando, setFinalizando] = useState<boolean>(false);

  const carrinho = useAppSelector((state) => state.carrinho.data);
  const usuario = useAppSelector((state) => state.auth.user);

  // Hook de pagamento
  const {
    cuponsAplicados,
    pagamentosParciais,
    solicitarAutorizacaoFinanceiraCheckout,
    aplicarCupom,
    removerCupom,
    adicionarPagamentoParcial,
    removerPagamentoParcial
  } = usePagamento();

  const pagamentoService = useMemo(() => new PagamentoServiceApi(), []);

  /**
   * Carrega informações de checkout do backend
   * Agora integra com /api/pagamento/info
   */
  const carregarCheckoutInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Carregar informações de pagamento do backend
      const infoPagamento = await pagamentoService.obterPagamentoInfo();
      
      // Mesclar dados do carrinho com informações do backend
      const checkoutData: ICheckoutInfo = {
        enderecoEntrega: {
          logradouro: 'Rua Bela Vista',
          numero: '1234',
          complemento: 'Apto 55',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01000-000'
        },
        enderecosDisponiveis: infoPagamento.enderecosCliente,
        cartoesSalvos: infoPagamento.cartoesCliente.map(c => ({
          uuid: c.uuid,
          ultimosDigitosCartao: c.ultimosDigitosCartao,
          nomeCliente: c.nomeCliente,
          nomeImpresso: c.nomeImpresso,
          bandeira: c.bandeira,
          validade: c.validade,
          principal: c.principal
        })),
        cuponsDisponiveis: infoPagamento.cuponsDisponiveis,
        freteOpcoes: infoPagamento.freteOpcoes,
        bandeirasPermitidas: infoPagamento.bandeirasPermitidas,
        resumoPedido: {
          quantidadeItens: carrinho?.itens.reduce((acc, item) => acc + item.quantidade, 0) ?? 0,
          subtotal: carrinho?.resumo.subtotal ?? 0,
          frete: carrinho?.resumo.frete ?? 0,
          descontoCupons: 0,
          total: (carrinho?.resumo.subtotal ?? 0) + (carrinho?.resumo.frete ?? 0)
        }
      };
      
      setData(checkoutData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar informações de checkout'));
      setLoading(false);
    }
  }, [carrinho, pagamentoService]);

  useEffect(() => {
    carregarCheckoutInfo();
  }, [carregarCheckoutInfo]);

  /**
   * Finaliza a compra com integração de pagamento
   */
  const handleFinalizarCompra = useCallback(async () => {
    if (!carrinho || !usuario) {
      setError(new Error('Carrinho vazio ou usuário não autenticado'));
      return;
    }

    setFinalizando(true);
    setError(null);
    
    try {
      // Calcular totais
      const subtotal = carrinho.resumo.subtotal;
      const frete = carrinho.resumo.frete;
      
      // Calcular desconto dos cupons
      const descontoCupons = cuponsAplicados.reduce((acc, cupom) => {
        if (cupom.tipo === 'promocional') {
          return acc + (subtotal * cupom.valor / 100);
        } else {
          return acc + cupom.valor;
        }
      }, 0);
      
      const total = subtotal + frete - descontoCupons;
      const valorPagoCartoes = pagamentosParciais.reduce((acc, p) => acc + p.valor, 0);
      
      // Validar forma de pagamento
      if (pagamentosParciais.length === 0 && cuponsAplicados.length === 0) {
        throw new Error('Selecione uma forma de pagamento');
      }
      
      // Gerar UUID da venda (simulado - viria do backend)
      const vendaUuid = crypto.randomUUID();
      
      // Processar pagamento se houver valor a pagar
      if (total - valorPagoCartoes > 0 || pagamentosParciais.length > 0) {
        const resultadoPagamento = await solicitarAutorizacaoFinanceiraCheckout(vendaUuid, total);
        
        if (!resultadoPagamento || !resultadoPagamento.sucesso) {
          throw new Error('Pagamento não aprovado. Verifique os dados do cartão.');
        }
        
        console.log('Pagamento aprovado:', resultadoPagamento);
      }

      // Preparar payload da venda
      const payload = {
        usuarioUuid: usuario.uuid,
        itens: carrinho.itens.map(it => ({
          livroUuid: it.uuid,
          quantidade: it.quantidade,
          precoUnitario: it.precoUnitario
        })),
        valorTotalItens: subtotal,
        valorFrete: frete,
        valorTotal: total,
        cuponsAplicados: cuponsAplicados,
        pagamentos: pagamentosParciais
      };

      // Finalizar venda
      const resultado = await CheckoutService.finalizarCompra(payload) as IVendaResultado;

      // Limpa carrinho e redireciona
      dispatch(limparCarrinho());
      navigate(`/pedido-confirmado?pedido=${resultado.id || resultado.ven_uuid || 'sucesso'}`);
    } catch (err: unknown) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido ao finalizar compra';
      setError(new Error(mensagem));
      alert('Erro ao finalizar compra: ' + mensagem);
    } finally {
      setFinalizando(false);
    }
  }, [carrinho, usuario, cuponsAplicados, pagamentosParciais, solicitarAutorizacaoFinanceiraCheckout, dispatch, navigate]);

  return {
    data,
    loading,
    error,
    finalizando,
    handleFinalizarCompra,
    recarregar: carregarCheckoutInfo,
    // Expor funções de pagamento para o componente
    cuponsAplicados,
    pagamentosParciais,
    aplicarCupom,
    removerCupom,
    adicionarPagamentoParcial,
    removerPagamentoParcial
  };
}
