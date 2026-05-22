import type { ITelefone } from '../../../interfaces/cliente';
import type { Genero } from '../../../interfaces/cliente';
import type { IEnderecoCliente } from '../../../interfaces/pagamento';
import { validarCpf } from '../../../utils/validacaoCpf';

export const REGEX_SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
export const REGEX_CPF_COM_MASCARA = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
export const REGEX_CPF_SEM_MASCARA = /^\d{11}$/;

export type Step1Fields = {
  regNome: string;
  regCpf: string;
  regEmail: string;
  regSenha: string;
  regConfirmaSenha: string;
  regDataNascimento: string;
  regGenero: Genero;
  regTelefone: ITelefone;
};

function erroNomeStep1(regNome: string): string | null {
  return regNome.trim() ? null : 'Nome é obrigatório.';
}

function erroCpfStep1(regCpf: string): string | null {
  const cpfLimpo = regCpf.trim();
  const formatoValido =
    REGEX_CPF_COM_MASCARA.test(cpfLimpo) || REGEX_CPF_SEM_MASCARA.test(cpfLimpo);
  if (!formatoValido) {
    return 'CPF inválido. Use 000.000.000-00 ou apenas 11 números.';
  }
  if (!validarCpf(cpfLimpo)) {
    return 'CPF inválido. Verifique os dígitos informados.';
  }
  return null;
}

function erroEmailStep1(regEmail: string): string | null {
  if (!regEmail.trim() || !regEmail.includes('@')) {
    return 'Informe um e-mail válido.';
  }
  return null;
}

function erroDataStep1(f: Step1Fields): string | null {
  if (!f.regDataNascimento) {
    return 'Data de nascimento é obrigatória.';
  }
  return null;
}

export function mensagemErroCadastroStep1(f: Step1Fields): string | null {
  return (
    erroNomeStep1(f.regNome) ??
    erroCpfStep1(f.regCpf) ??
    erroEmailStep1(f.regEmail) ??
    erroDataStep1(f)
  );
}

export function mensagemErroEnderecoObrigatorio(
  endereco: Omit<IEnderecoCliente, 'uuid'>,
  label: string,
): string | null {
  if (!endereco.logradouro.trim()) {
    return `${label}: Logradouro é obrigatório.`;
  }
  if (!endereco.numero.trim()) {
    return `${label}: Número é obrigatório.`;
  }
  if (!endereco.bairro.trim()) {
    return `${label}: Bairro é obrigatório.`;
  }
  if (!endereco.cep.trim()) {
    return `${label}: CEP é obrigatório.`;
  }
  if (!endereco.cidade.trim()) {
    return `${label}: Cidade é obrigatório.`;
  }
  if (!endereco.estado.trim()) {
    return `${label}: Estado é obrigatório.`;
  }
  return null;
}
