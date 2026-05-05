import { useCallback } from 'react';
import type { AppDispatch } from '../store';
import type { ICarrinho } from '../interfaces/carrinho';
import type { IUsuario } from '../interfaces/auth';
import type { ICupomAplicado, IPagamentoParcial } from '../interfaces/pagamento';
import type { IFreteOpcao, IEntregaInputDto } from '../interfaces/entrega';
import type { ICheckoutInfo } from '../interfaces/checkout';
import type { OpcoesFinalizarCheckout } from '../types/checkout';
import { executarFinalizarCheckout, tratarErroFinalizarCheckout } from '../utils/executarFinalizacaoCompra';
import { EntregaServiceApi } from '../services/api/entregaServiceApi';
import { PagamentoService } from '../services/pagamentoService';

interface UseFinalizarCompraAcaoParams {
  carrinho: ICarrinho | null;
  usuario: IUsuario | null;
  freteSelecionado: IFreteOpcao | null;
  cuponsAplicados: ICupomAplicado[];
  parcelasLiquidacao: IPagamentoParcial[];
  dispatch: AppDispatch;
  router: {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
  };
  data: ICheckoutInfo | null;
  showError: (mensagem: string) => void;
  definirErroCheckout: (erro: Error | null) => void;
  definirFinalizando: (valor: boolean) => void;
}

export function useFinalizarCompraAcao({
  carrinho,
  usuario,
  freteSelecionado,
  cuponsAplicados,
  parcelasLiquidacao,
  dispatch,
  router,
  data,
  showError,
  definirErroCheckout,
  definirFinalizando,
}: UseFinalizarCompraAcaoParams) {
  return useCallback(
    async (opcoes?: OpcoesFinalizarCheckout) => {
      if (!carrinho || !usuario) {
        definirErroCheckout(new Error('Carrinho vazio ou usuário não autenticado'));
        return;
      }

      const freteParaEntrega = freteSelecionado;
      if (!freteParaEntrega) {
        showError('Selecione uma opção de frete.');
        return;
      }

      definirFinalizando(true);
      definirErroCheckout(null);

      try {
        await executarFinalizarCheckout({
          carrinho,
          usuario,
          cuponsAplicados,
          parcelasLiquidacao,
          freteSelecionado: freteParaEntrega,
          opcoes,
          dispatch,
          navigate: router,
          pagamentoService: PagamentoService,
          checkoutData: data,
          cadastrarEntrega: async (vendaUuid, endereco, custoFreteRegistradoNaVenda) => {
            const dados: IEntregaInputDto = {
              vendaUuid,
              tipoFrete: freteParaEntrega.tipo,
              endereco,
              custo: custoFreteRegistradoNaVenda,
            };
            return new EntregaServiceApi().cadastrarEntrega(dados);
          },
          onSalvarCartaoCheckoutFalhou: (erro) => {
            showError(
              `Pedido concluído com sucesso, mas o cartão não foi salvo no perfil: ${erro.message}. Você pode cadastrar o cartão em Meu Perfil.`,
            );
          },
        });
      } catch (erro: unknown) {
        tratarErroFinalizarCheckout(erro, definirErroCheckout, showError);
      } finally {
        definirFinalizando(false);
      }
    },
    [
      carrinho,
      usuario,
      freteSelecionado,
      cuponsAplicados,
      parcelasLiquidacao,
      dispatch,
      router,
      data,
      showError,
      definirErroCheckout,
      definirFinalizando,
    ],
  );
}
