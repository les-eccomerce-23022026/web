import type { IFreteOpcao } from '../interfaces/entrega';
import type { IEnderecoEntregaInput } from '../interfaces/entrega';
import type { IPagamentoParcial } from '../interfaces/pagamento';

type FreteSelecionado = IFreteOpcao | null | undefined;

export function validarFormaPagamentoETotais(
  total: number,
  pagamentosEfetivos: IPagamentoParcial[],
): void {
  if (total > 0 && pagamentosEfetivos.length === 0) {
    throw new Error('Selecione uma forma de pagamento');
  }
}

export function validarFreteEEnderecoApiReal(
  freteSelecionado: FreteSelecionado,
  enderecoEntrega: IEnderecoEntregaInput | undefined | null,
): void {
  if (!freteSelecionado) {
    throw new Error('Selecione uma opção de frete.');
  }
  if (!enderecoEntrega) {
    throw new Error('Selecione o endereço de entrega.');
  }
}
