import type { IPagamentoSelecionado, ICartaoSalvoPagamento } from '@/interfaces/IPagamento';

export type PagamentoCartaoLinha = { cartaoUuid: string; valor: number };

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
  pagamentosOverride: PagamentoCartaoLinha[] | undefined,
  pagamentosParciais: PagamentoCartaoLinha[],
  pagamentoSelecionado: IPagamentoSelecionado | null,
  valorTotal: number,
): PagamentoCartaoLinha[] {
  if (pagamentosOverride && pagamentosOverride.length > 0) {
    return pagamentosOverride;
  }
  if (pagamentosParciais.length > 0) {
    return pagamentosParciais;
  }
  const uuid = uuidCartaoDoSelecionado(pagamentoSelecionado);
  if (uuid === null) {
    return [];
  }
  return [{ cartaoUuid: uuid, valor: valorTotal }];
}
