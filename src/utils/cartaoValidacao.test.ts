import { validarLuhn, detectarBandeira } from './cartaoValidacao';

describe('cartaoValidacao', () => {
  describe('validarLuhn', () => {
    it('deve validar número válido', () => {
      expect(validarLuhn('4532015112830366')).toBe(true);
    });

    it('deve rejeitar número inválido', () => {
      expect(validarLuhn('1234567890123456')).toBe(false);
    });

    it('deve rejeitar número muito curto', () => {
      expect(validarLuhn('123')).toBe(false);
    });

    it('deve rejeitar número muito longo', () => {
      expect(validarLuhn('12345678901234567890')).toBe(false);
    });
  });

  describe('detectarBandeira', () => {
    it('deve detectar Visa', () => {
      expect(detectarBandeira('4111111111111111')).toBe('Visa');
    });

    it('deve detectar Mastercard', () => {
      expect(detectarBandeira('5555555555554444')).toBe('Mastercard');
    });

    it('deve detectar American Express', () => {
      expect(detectarBandeira('378282246310005')).toBe('American Express');
    });

    it('deve detectar Hipercard', () => {
      expect(detectarBandeira('6062828888866688')).toBe('Hipercard');
    });

    it('deve retornar null para bandeira desconhecida', () => {
      expect(detectarBandeira('9999999999999999')).toBeNull();
    });
  });
});
