import { formatarValorFrete } from './freteCalculoUtils';

describe('freteCalculoUtils', () => {
  describe('formatarValorFrete', () => {
    it('deve formatar valor zero como Grátis', () => {
      expect(formatarValorFrete(0)).toBe('Grátis');
    });

    it('deve formatar valor positivo com vírgula decimal', () => {
      expect(formatarValorFrete(10.5)).toBe('10,50');
      expect(formatarValorFrete(25)).toBe('25,00');
      expect(formatarValorFrete(100)).toBe('100,00');
    });

    it('deve formatar valor com separador de milhar', () => {
      expect(formatarValorFrete(1234.56)).toBe('1.234,56');
    });
  });
});
