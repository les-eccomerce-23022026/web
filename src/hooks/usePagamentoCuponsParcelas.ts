import { useCallback, useState } from 'react';
import type { ICupomAplicado, IPagamentoParcial } from '../interfaces/pagamento';
import { validarValorParcial } from '../utils/cartaoValidacao';
import { podeAplicarCupom } from './usePagamentoHelpers';

interface UsePagamentoCuponsParcelasParams {
  definirErro: (erro: Error | null) => void;
}

export function usePagamentoCuponsParcelas({ definirErro }: UsePagamentoCuponsParcelasParams) {
  const [cuponsAplicados, setCuponsAplicados] = useState<ICupomAplicado[]>([]);
  const [parcelasLiquidacao, setParcelasLiquidacao] = useState<IPagamentoParcial[]>([]);

  const aplicarCupom = useCallback(
    (cupom: ICupomAplicado) => {
      if (!podeAplicarCupom(cupom, cuponsAplicados)) {
        definirErro(new Error('Apenas um cupom promocional é permitido por compra'));
        return false;
      }
      setCuponsAplicados((anterior) => [...anterior, cupom]);
      return true;
    },
    [cuponsAplicados, definirErro],
  );

  const removerCupom = useCallback((cupomUuid: string) => {
    setCuponsAplicados((anterior) => anterior.filter((cupom) => cupom.uuid !== cupomUuid));
  }, []);

  const adicionarParcelaLiquidacao = useCallback(
    (referenciaMeioPagamento: string, valor: number) => {
      if (!validarValorParcial(valor)) {
        definirErro(new Error('Valor mínimo por cartão é R$ 10,00'));
        return false;
      }
      setParcelasLiquidacao((anterior) => [...anterior, { referenciaMeioPagamento, valor }]);
      return true;
    },
    [definirErro],
  );

  const removerParcelaLiquidacao = useCallback((indice: number) => {
    setParcelasLiquidacao((anterior) => anterior.filter((_, posicao) => posicao !== indice));
  }, []);

  const definirParcelasLiquidacao = useCallback((lista: IPagamentoParcial[]) => {
    setParcelasLiquidacao(lista);
  }, []);

  const limparCuponsParcelas = useCallback(() => {
    setCuponsAplicados([]);
    setParcelasLiquidacao([]);
  }, []);

  return {
    cuponsAplicados,
    parcelasLiquidacao,
    aplicarCupom,
    removerCupom,
    adicionarParcelaLiquidacao,
    removerParcelaLiquidacao,
    definirParcelasLiquidacao,
    limparCuponsParcelas,
  };
}
