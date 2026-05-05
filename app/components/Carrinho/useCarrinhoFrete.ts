import { useCallback, useMemo } from 'react';
import { useAppDispatch } from '@/store/hooks';
import {
  definirFreteResumoCarrinho,
} from '@/store/slices/carrinhoSlice';
import {
  persistirCotacaoFreteCarrinho,
} from '@/store/slices/cotacaoFreteSlice';
import type { IFreteOpcao } from '@/interfaces/entrega';
import { assinaturaItensCarrinho } from '@/utils/carrinhoAssinatura';
import type { ICarrinho } from '@/interfaces/carrinho';

export function useCarrinhoFrete(
  entrega: {
    selecionarFrete: (opcao: IFreteOpcao) => void;
    freteCalculado: any;
    cepDestino: string;
    limparFrete: () => void;
  },
  data: ICarrinho | null,
) {
  const dispatch = useAppDispatch();

  const carrinhoAssinatura = useMemo(() => data ? assinaturaItensCarrinho(data) : null, [data]);

  const handleFreteSelecionado = useCallback(
    (opcao: IFreteOpcao) => {
      entrega.selecionarFrete(opcao);
      dispatch(definirFreteResumoCarrinho({ frete: opcao.valor }));
      if (!data || !entrega.freteCalculado || !carrinhoAssinatura) return;
      dispatch(
        persistirCotacaoFreteCarrinho({
          opcaoSelecionada: opcao,
          freteCalculado: entrega.freteCalculado,
          cepDestino: entrega.cepDestino.replace(/\D/g, ''),
          assinaturaItens: carrinhoAssinatura,
          subtotalCotado: data.resumo.subtotal,
        }),
      );
    },
    [dispatch, entrega, data, carrinhoAssinatura],
  );

  return { handleFreteSelecionado, carrinhoAssinatura };
}
