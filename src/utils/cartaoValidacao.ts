import type { ICartaoCreditoInput } from '@/interfaces/pagamento';

/** Algoritmo de Luhn — número apenas com dígitos. */
export function validarLuhn(numero: string): boolean {
  const numeros = numero.replace(/\D/g, '');
  if (numeros.length < 13 || numeros.length > 19) return false;

  let soma = 0;
  let alternar = false;
  for (let i = numeros.length - 1; i >= 0; i--) {
    let digito = parseInt(numeros.charAt(i), 10);
    if (alternar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    soma += digito;
    alternar = !alternar;
  }
  return soma % 10 === 0;
}

const RE_ELO_BINS: RegExp[] = [
  /^4011(78|79)/,
  /^43(1274|8935)/,
  /^45(1274|763(2|3)|769(3|4|5|6|7))/,
  /^50(4175|6699|67[0-6][0-9]|677[0-8]|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9])/,
  /^627780/,
  /^63(6297|6368)/,
  /^65(0(0(3([1-3][0-9]|4[0-9])|4([2-3][0-9]|4[0-9]|5[0-2])|5([0-2][0-9]|3[0-8])|9([0-2][0-9]|3[0-7]))|[1-8][0-9]{3}|9[0-2][0-9]{2}|93[0-7][0-9])|16(5[2-9][0-9]|6[0-3][0-9])|50(0[0-9]|1[0-8][0-9]|19[0-5]))/,
];

function isEloBin(numeros: string): boolean {
  return RE_ELO_BINS.some((re) => re.test(numeros));
}

function isMastercardBin(numeros: string): boolean {
  return /^5[1-5]/.test(numeros) || /^2(2[2-9][1-9]|[3-6]\d{2}|7[0-1]\d|720)/.test(numeros);
}

export function detectarBandeira(numero: string): string | null {
  const numeros = numero.replace(/\D/g, '');
  if (/^4/.test(numeros)) return 'Visa';
  if (isMastercardBin(numeros)) return 'Mastercard';
  if (/^3[47]/.test(numeros)) return 'American Express';
  if (isEloBin(numeros)) return 'Elo';
  if (/^60/.test(numeros)) return 'Hipercard';
  return null;
}

function validarNumeroCartao(numeroLimpo: string): string[] {
  const erros: string[] = [];
  if (numeroLimpo.length < 13 || numeroLimpo.length > 19) {
    erros.push('Número do cartão inválido (13-19 dígitos)');
  } else if (!validarLuhn(numeroLimpo)) {
    erros.push('Número do cartão inválido (falha na validação)');
  }
  return erros;
}

function validarBandeiraAceita(
  numeroCartao: string,
  bandeiraInformada: string,
  bandeirasPermitidas: string[],
): string[] {
  const bandeira = detectarBandeira(numeroCartao) || bandeiraInformada;
  if (bandeirasPermitidas.length > 0 && !bandeirasPermitidas.includes(bandeira)) {
    return [`Bandeira ${bandeira} não é aceita. Permitidas: ${bandeirasPermitidas.join(', ')}`];
  }
  return [];
}

function validarValidadeMmAa(validade: string): string[] {
  const validadeRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!validadeRegex.test(validade)) {
    return ['Validade deve estar no formato MM/AA'];
  }
  const [mes, ano] = validade.split('/').map(Number);
  const dataAtual = new Date();
  const anoAtual = dataAtual.getFullYear() % 100;
  const mesAtual = dataAtual.getMonth() + 1;
  if (ano < anoAtual || (ano === anoAtual && mes < mesAtual)) {
    return ['Cartão expirado'];
  }
  return [];
}

export function validarCartao(
  cartao: ICartaoCreditoInput,
  bandeirasPermitidas: string[] = [],
): { valido: boolean; erros: string[] } {
  const numeroLimpo = cartao.numero.replace(/\D/g, '');
  const erros: string[] = [
    ...validarNumeroCartao(numeroLimpo),
    ...validarBandeiraAceita(cartao.numero, cartao.bandeira, bandeirasPermitidas),
  ];

  if (!cartao.nomeTitular || cartao.nomeTitular.trim().length < 2) {
    erros.push('Nome do titular inválido');
  }
  erros.push(...validarValidadeMmAa(cartao.validade));

  const cvvLimpo = cartao.cvv.replace(/\D/g, '');
  if (cvvLimpo.length < 3 || cvvLimpo.length > 4) {
    erros.push('CVV inválido (3-4 dígitos)');
  }

  return { valido: erros.length === 0, erros };
}

export function validarValorParcial(valor: number, minimo: number = 10): boolean {
  return valor >= minimo;
}

export interface CartaoCreditoFormState {
  numero: string;
  nomeTitular: string;
  validade: string;
  cvv: string;
  bandeiraDetectada: string | null;
  bandeirasPermitidas: string[];
}

function errosNumeroCartaoForm(s: CartaoCreditoFormState): string[] {
  const numeroLimpo = s.numero.replace(/\D/g, '');
  if (numeroLimpo.length < 13 || numeroLimpo.length > 19) {
    return ['Número do cartão inválido'];
  }
  if (!validarLuhn(numeroLimpo)) {
    return ['Número do cartão inválido (validação falhou)'];
  }
  return [];
}

function errosBandeiraListaForm(s: CartaoCreditoFormState): string[] {
  if (
    s.bandeiraDetectada &&
    s.bandeirasPermitidas.length > 0 &&
    !s.bandeirasPermitidas.includes(s.bandeiraDetectada)
  ) {
    return [`Bandeira ${s.bandeiraDetectada} não é aceita`];
  }
  return [];
}

function errosValidadeExpiracaoForm(s: CartaoCreditoFormState): string[] {
  const validadeRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!validadeRegex.test(s.validade)) {
    return ['Validade deve estar no formato MM/AA'];
  }
  const [mes, ano] = s.validade.split('/').map(Number);
  const dataAtual = new Date();
  const anoAtual = dataAtual.getFullYear() % 100;
  const mesAtual = dataAtual.getMonth() + 1;
  if (ano < anoAtual || (ano === anoAtual && mes < mesAtual)) {
    return ['Cartão expirado'];
  }
  return [];
}

function errosCvvTamanhoForm(s: CartaoCreditoFormState): string[] {
  const cvvMax = s.bandeiraDetectada === 'American Express' ? 4 : 3;
  if (s.cvv.length !== cvvMax) {
    return [`CVV deve ter ${cvvMax} dígitos`];
  }
  return [];
}

/** Validação do formulário de novo cartão (MM/AA, regras de CVV por bandeira). */
export function validarCamposFormularioCartaoCredito(s: CartaoCreditoFormState): string[] {
  const nomeErro = s.nomeTitular.trim().length < 2 ? ['Nome do titular inválido'] : [];
  return [
    ...errosNumeroCartaoForm(s),
    ...errosBandeiraListaForm(s),
    ...nomeErro,
    ...errosValidadeExpiracaoForm(s),
    ...errosCvvTamanhoForm(s),
  ];
}
