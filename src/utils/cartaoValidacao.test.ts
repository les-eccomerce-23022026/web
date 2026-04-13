import { describe, it, expect } from 'vitest';
import { validarCartao } from './cartaoValidacao';
import type { ICartaoCreditoInput } from '@/interfaces/pagamento';

describe('cartaoValidacao', () => {
  const cartaoValido: ICartaoCreditoInput = {
    numero: '4242424242424242', // Visa válido (Luhn)
    nomeTitular: 'JOAO SILVA',
    validade: '12/29',
    cvv: '123',
    bandeira: 'Visa'
  };

  it('deve validar um cartão correto', () => {
    const resultado = validarCartao(cartaoValido);
    expect(resultado.valido).toBe(true);
    expect(resultado.erros).toHaveLength(0);
  });

  it('deve retornar erro para número de cartão muito curto', () => {
    const resultado = validarCartao({ ...cartaoValido, numero: '123' });
    expect(resultado.valido).toBe(false);
    expect(resultado.erros).toContain('Número do cartão inválido (13-19 dígitos)');
  });

  it('deve retornar erro para número de cartão com falha no Luhn', () => {
    // 4242424242424241 falha no Luhn se o último dígito mudar
    const resultado = validarCartao({ ...cartaoValido, numero: '4242424242424241' });
    expect(resultado.valido).toBe(false);
    expect(resultado.erros).toContain('Número do cartão inválido (falha na validação)');
  });

  it('deve retornar erro para nome de titular inválido', () => {
    const resultado = validarCartao({ ...cartaoValido, nomeTitular: 'A' });
    expect(resultado.valido).toBe(false);
    expect(resultado.erros).toContain('Nome do titular inválido');
  });

  it('deve retornar erro para cartão expirado', () => {
    const resultado = validarCartao({ ...cartaoValido, validade: '01/20' });
    expect(resultado.valido).toBe(false);
    expect(resultado.erros).toContain('Cartão expirado');
  });

  it('deve retornar erro para CVV inválido', () => {
    const resultado = validarCartao({ ...cartaoValido, cvv: '1' });
    expect(resultado.valido).toBe(false);
    expect(resultado.erros).toContain('CVV inválido (3-4 dígitos)');
  });
});
