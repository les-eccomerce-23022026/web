import type { IEntregaInputDto, IFreteCalculoInput } from '../interfaces/entrega';

export function criarDadosCalculoFrete(
  cep: string,
  peso?: number,
  valorTotal?: number,
): IFreteCalculoInput {
  return { cepDestino: cep, peso, valorTotal };
}

export function criarDadosEntrega(
  vendaUuid: string,
  tipoFrete: string,
  endereco: IEntregaInputDto['endereco'],
  custo: number,
): IEntregaInputDto {
  return { vendaUuid, tipoFrete, endereco, custo };
}

export function normalizarErroEntrega(erro: unknown, mensagemPadrao: string): Error {
  if (erro instanceof Error) return erro;
  return new Error(mensagemPadrao);
}

export function normalizarCepHidratado(cep: string): string {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length === 8) return cepLimpo;
  return cep;
}
