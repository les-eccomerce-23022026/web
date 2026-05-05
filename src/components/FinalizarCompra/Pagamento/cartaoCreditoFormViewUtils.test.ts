import { describe, expect, it } from 'vitest';
import { detectarAmex, obterConfiguracaoCvv } from './cartaoCreditoFormViewUtils';

describe('cartaoCreditoFormViewUtils', () => {
  it('deve detectar bandeira american express', () => {
    expect(detectarAmex('American Express')).toBe(true);
    expect(detectarAmex('Visa')).toBe(false);
    expect(detectarAmex(null)).toBe(false);
  });

  it('deve retornar configuracao de cvv para amex', () => {
    expect(obterConfiguracaoCvv(true)).toEqual({
      placeholder: '0000',
      maxLength: 4,
    });
  });

  it('deve retornar configuracao de cvv padrao para demais bandeiras', () => {
    expect(obterConfiguracaoCvv(false)).toEqual({
      placeholder: '000',
      maxLength: 3,
    });
  });
});
