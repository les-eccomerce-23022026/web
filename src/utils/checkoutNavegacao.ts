import type { IFreteOpcao } from '../interfaces/entrega';
import type { IEnderecoEntregaInput } from '../interfaces/entrega';
import type { ResultadoLiquidacaoPagamentos } from './finalizarCompraLiquidacaoPagamentos';
import { salvarCheckoutPixPendente } from './checkoutPixPendente';

type FreteSelecionado = IFreteOpcao | null | undefined;

export function navegarAposCheckout(params: {
  liquidacaoPix: ResultadoLiquidacaoPagamentos | null;
  vendaUuid: string;
  freteSelecionado: FreteSelecionado;
  enderecoEntrega: IEnderecoEntregaInput | undefined;
  navigate: { push: (path: string) => void };
  useMock: boolean;
}): void {
  const {
    liquidacaoPix,
    vendaUuid,
    freteSelecionado,
    enderecoEntrega,
    navigate,
    useMock,
  } = params;

  if (!useMock && liquidacaoPix?.pixPendente && freteSelecionado && enderecoEntrega) {
    salvarCheckoutPixPendente({
      vendaUuid,
      pixPendentes: liquidacaoPix.pixPendentes,
      entrega: {
        endereco: enderecoEntrega,
        tipoFrete: freteSelecionado.tipo,
        custoFrete: freteSelecionado.valor,
      },
    });
    navigate.push(`/pagamento-pix?venda=${encodeURIComponent(vendaUuid)}`);
    return;
  }

  navigate.push(`/pedido-confirmado?pedido=${vendaUuid}`);
}
