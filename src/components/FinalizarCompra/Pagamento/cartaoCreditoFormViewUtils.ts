export function detectarAmex(bandeiraDetectada: string | null): boolean {
  return bandeiraDetectada === 'American Express';
}

export function obterConfiguracaoCvv(amex: boolean) {
  if (amex) {
    return {
      placeholder: '0000',
      maxLength: 4,
    };
  }

  return {
    placeholder: '000',
    maxLength: 3,
  };
}
