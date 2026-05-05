import type {
  ICupomAplicado,
  IProcessarPagamentoInput,
} from '../interfaces/pagamento';

export function podeAplicarCupom(cupom: ICupomAplicado, cuponsAplicados: ICupomAplicado[]): boolean {
  if (cupom.tipo !== 'promocional') return true;
  const possuiPromocional = cuponsAplicados.some((item) => item.tipo === 'promocional');
  return !possuiPromocional;
}

export function normalizarErroPagamento(erro: unknown, mensagemPadrao: string): Error {
  if (erro instanceof Error) return erro;
  return new Error(mensagemPadrao);
}

export function criarInputProcessarPagamento(
  vendaUuid: string,
  valorTotal: number,
  pagamentosCartao: IProcessarPagamentoInput['pagamentosCartao'],
  cuponsAplicados: IProcessarPagamentoInput['cuponsAplicados'],
  idIntencao: string,
  segredoConfirmacao: string,
): IProcessarPagamentoInput {
  return {
    vendaUuid,
    pagamentosCartao,
    cuponsAplicados,
    valorTotal,
    idIntencao,
    segredoConfirmacao,
  };
}
