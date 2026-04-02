import type { IProcessarPagamentoResultado } from '@/interfaces/pagamento';

type SolicitarAutorizacao = (
  vendaUuid: string,
  valorTotal: number,
  pagamentosOverride?: { cartaoUuid: string; valor: number }[],
) => Promise<IProcessarPagamentoResultado | null>;

export async function garantirAutorizacaoPagamentoSeNecessario(
  total: number,
  pagamentosEfetivos: { cartaoUuid: string; valor: number }[],
  vendaUuid: string,
  solicitarAutorizacaoFinanceiraCheckout: SolicitarAutorizacao,
): Promise<void> {
  if (total <= 0 || pagamentosEfetivos.length === 0) {
    return;
  }
  const resultadoPagamento = await solicitarAutorizacaoFinanceiraCheckout(
    vendaUuid,
    total,
    pagamentosEfetivos,
  );
  if (!resultadoPagamento || !resultadoPagamento.sucesso) {
    throw new Error('Pagamento não aprovado. Verifique os dados do cartão.');
  }
}
