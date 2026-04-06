import type { IPagamentoSelecionado, ICartaoSalvoPagamento, IPagamentoParcial } from '@/interfaces/pagamento';

function uuidCartaoDoSelecionado(pagamentoSelecionado: IPagamentoSelecionado | null): string | null {
  if (!pagamentoSelecionado || pagamentoSelecionado.tipo !== 'cartao_credito') {
    return null;
  }
  const cartao = pagamentoSelecionado.cartao ?? {};
  if (!('uuid' in cartao)) {
    return 'novo';
  }
  return (cartao as ICartaoSalvoPagamento).uuid || 'novo';
}

export function montarPagamentosCartaoParaAutorizacao(
  pagamentosOverride: IPagamentoParcial[] | undefined,
  parcelasLiquidacao: IPagamentoParcial[],
  pagamentoSelecionado: IPagamentoSelecionado | null,
  valorTotal: number,
): IPagamentoParcial[] {
  if (pagamentosOverride && pagamentosOverride.length > 0) {
    return pagamentosOverride;
  }
  if (parcelasLiquidacao.length > 0) {
    return parcelasLiquidacao;
  }
  const uuid = uuidCartaoDoSelecionado(pagamentoSelecionado);
  if (uuid === null) {
    return [];
  }
  return [{ referenciaMeioPagamento: uuid, valor: valorTotal, parcelasCartao: 1 }];
}
