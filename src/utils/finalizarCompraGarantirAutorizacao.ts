import type { IProcessarPagamentoResultado, IPagamentoParcial } from '@/interfaces/pagamento';

type SolicitarAutorizacao = (
  vendaUuid: string,
  valorTotal: number,
  pagamentosOverride?: IPagamentoParcial[],
) => Promise<IProcessarPagamentoResultado | null>;

export async function garantirAutorizacaoPagamentoSeNecessario(
  total: number,
  pagamentosEfetivos: IPagamentoParcial[],
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
