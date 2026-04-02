import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutService } from '@/services/CheckoutService';
import { PagamentoServiceApi } from '@/services/api/PagamentoServiceApi';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { limparCarrinho, limparCarrinhoRemoto } from '@/store/slices/carrinhoSlice';
import { USE_MOCK } from '@/config/apiConfig';
import type { ICheckoutInfo } from '@/interfaces/ICheckout';
import type { ICartaoCreditoInput } from '@/interfaces/IPagamento';
import type { IVendaInput } from '@/services/contracts/ICheckoutService';
import { usePagamento } from './usePagamento';
import { useEntrega } from './useEntrega';
import type { FreteCalculoEntregaApi } from '@/components/checkout/entrega';

export type OpcoesFinalizarCheckout = {
  cartaoSalvoUuid?: string | null;
  novoCartao?: ICartaoCreditoInput | null;
};

/**
 * Checkout: uma instância de `useEntrega` e uma de `usePagamento` compartilhadas
 * entre o resumo e `handleFinalizarCompra` (sem segundo `useEntrega` na árvore).
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

  const entrega = useEntrega();
  const {
    freteSelecionado,
    selecionarFrete,
    calcularFrete,
    freteCalculado,
    loading: entregaLoading,
    error: entregaError,
    formatarCep,
    validarCep,
  } = entrega;

  const entregaParaFreteCalculo: FreteCalculoEntregaApi = useMemo(
    () => ({
      calcularFrete,
      freteCalculado,
      loading: entregaLoading,
      error: entregaError,
      formatarCep,
      validarCep,
    }),
    [calcularFrete, freteCalculado, entregaLoading, entregaError, formatarCep, validarCep],
  );

  const {
    cuponsAplicados,
    pagamentosParciais,
    solicitarAutorizacaoFinanceiraCheckout,
    aplicarCupom,
    removerCupom,
    adicionarPagamentoParcial,
    removerPagamentoParcial,
  } = usePagamento();

  const pagamentoService = useMemo(() => new PagamentoServiceApi(), []);

  const carregarCheckoutInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const infoPagamento = await pagamentoService.obterPagamentoInfo();

      const primeiro = infoPagamento.enderecosCliente?.[0];
      const enderecoEntrega = primeiro
        ? {
            logradouro: primeiro.logradouro,
            numero: primeiro.numero,
            complemento: primeiro.complemento,
            cidade: primeiro.cidade,
            estado: primeiro.estado,
            cep: primeiro.cep,
          }
        : {
            logradouro: 'Rua Bela Vista',
            numero: '1234',
            complemento: 'Apto 55',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01000-000',
          };

      const checkoutData: ICheckoutInfo = {
        enderecoEntrega,
        enderecosDisponiveis: infoPagamento.enderecosCliente,
        cartoesSalvos: infoPagamento.cartoesCliente.map((c) => ({
          uuid: c.uuid,
          ultimosDigitosCartao: c.ultimosDigitosCartao,
          nomeCliente: c.nomeCliente,
          nomeImpresso: c.nomeImpresso,
          bandeira: c.bandeira,
          validade: c.validade,
          principal: c.principal,
        })),
        cuponsDisponiveis: infoPagamento.cuponsDisponiveis,
        freteOpcoes: infoPagamento.freteOpcoes,
        bandeirasPermitidas: infoPagamento.bandeirasPermitidas,
        resumoPedido: {
          quantidadeItens: carrinho?.itens.reduce((acc, item) => acc + item.quantidade, 0) ?? 0,
          subtotal: carrinho?.resumo.subtotal ?? 0,
          frete: carrinho?.resumo.frete ?? 0,
          descontoCupons: 0,
          total: (carrinho?.resumo.subtotal ?? 0) + (carrinho?.resumo.frete ?? 0),
        },
      };

      setData(checkoutData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar informações de checkout'));
      setLoading(false);
    }
  }, [carrinho, pagamentoService]);

  useEffect(() => {
    void carregarCheckoutInfo();
  }, [carregarCheckoutInfo]);

  const handleFinalizarCompra = useCallback(
    async (opcoes?: OpcoesFinalizarCheckout) => {
      if (!carrinho || !usuario) {
        setError(new Error('Carrinho vazio ou usuário não autenticado'));
        return;
      }

      setFinalizando(true);
      setError(null);

      try {
        const subtotal = carrinho.resumo.subtotal;
        const frete = freteSelecionado?.valor ?? carrinho.resumo.frete;

        const descontoCupons = cuponsAplicados.reduce((acc, cupom) => {
          if (cupom.tipo === 'promocional') {
            return acc + (subtotal * cupom.valor) / 100;
          }
          return acc + cupom.valor;
        }, 0);

        const total = subtotal + frete - descontoCupons;

        let pagamentosEfetivos = [...pagamentosParciais];
        if (pagamentosEfetivos.length === 0 && total > 0) {
          if (opcoes?.cartaoSalvoUuid) {
            pagamentosEfetivos = [{ cartaoUuid: opcoes.cartaoSalvoUuid, valor: total }];
          } else if (opcoes?.novoCartao) {
            pagamentosEfetivos = [{ cartaoUuid: 'novo', valor: total }];
          }
        }

        if (total > 0 && pagamentosEfetivos.length === 0) {
          throw new Error('Selecione uma forma de pagamento');
        }

        const vendaUuid = crypto.randomUUID();

        if (total > 0 && pagamentosEfetivos.length > 0) {
          const resultadoPagamento = await solicitarAutorizacaoFinanceiraCheckout(
            vendaUuid,
            total,
            pagamentosEfetivos,
          );

          if (!resultadoPagamento || !resultadoPagamento.sucesso) {
            throw new Error('Pagamento não aprovado. Verifique os dados do cartão.');
          }
        }

        const payload: IVendaInput = {
          usuarioUuid: usuario.uuid,
          itens: carrinho.itens.map((it) => ({
            livroUuid: it.uuid,
            quantidade: it.quantidade,
            precoUnitario: it.precoUnitario,
          })),
          valorTotalItens: subtotal,
          valorFrete: frete,
          valorTotal: total,
          cuponsAplicados,
          pagamentos: pagamentosEfetivos,
        };

        const resultado = await CheckoutService.finalizarCompra(payload);

        if (USE_MOCK) {
          dispatch(limparCarrinho());
        } else {
          try {
            await dispatch(limparCarrinhoRemoto()).unwrap();
          } catch {
            dispatch(limparCarrinho());
          }
        }
        navigate(`/pedido-confirmado?pedido=${resultado.id || resultado.ven_uuid || 'sucesso'}`);
      } catch (err: unknown) {
        const mensagem = err instanceof Error ? err.message : 'Erro desconhecido ao finalizar compra';
        setError(new Error(mensagem));
        alert('Erro ao finalizar compra: ' + mensagem);
      } finally {
        setFinalizando(false);
      }
    },
    [
      carrinho,
      usuario,
      cuponsAplicados,
      pagamentosParciais,
      freteSelecionado,
      solicitarAutorizacaoFinanceiraCheckout,
      dispatch,
      navigate,
    ],
  );

  return {
    data,
    loading,
    error,
    finalizando,
    handleFinalizarCompra,
    recarregar: carregarCheckoutInfo,
    cuponsAplicados,
    pagamentosParciais,
    aplicarCupom,
    removerCupom,
    adicionarPagamentoParcial,
    removerPagamentoParcial,
    freteSelecionado,
    selecionarFrete,
    entregaParaFreteCalculo,
  };
}
