import type { ICliente } from '@/interfaces/cliente';

export type AlteracoesSensveis = {
  isEmailChanged: boolean;
  isCpfChanged: boolean;
  isTelChanged: boolean;
};

export function obterValoresOriginaisMascarados(cliente: ICliente | null) {
  const emailAtualMascarado = cliente?.emailMascarado || cliente?.email || '';
  const cpfAtualMascarado = cliente?.cpfMascarado || cliente?.cpf || '';
  const telefoneAtualMascarado = cliente?.telefone
    ? cliente.telefone.numeroMascarado || cliente.telefone.numero
    : '';

  return {
    emailAtualMascarado,
    cpfAtualMascarado,
    telefoneAtualMascarado,
  };
}

export function detectarAlteracoesSensveis(params: {
  visualizacaoEmail: string;
  visualizacaoCpf: string;
  visualizacaoTelefone: string;
  emailAtualMascarado: string;
  cpfAtualMascarado: string;
  telefoneAtualMascarado: string;
}): AlteracoesSensveis {
  const isEmailChanged =
    params.visualizacaoEmail.trim() !== '' &&
    params.visualizacaoEmail !== params.emailAtualMascarado;

  const isCpfChanged =
    params.visualizacaoCpf.trim() !== '' &&
    params.visualizacaoCpf !== params.cpfAtualMascarado;

  const isTelChanged =
    params.visualizacaoTelefone.trim() !== '' &&
    params.visualizacaoTelefone !== params.telefoneAtualMascarado;

  return {
    isEmailChanged,
    isCpfChanged,
    isTelChanged,
  };
}
