import { formatarValorMonetario, validarValorPagamentoParcial, calcularValorRestante, formatarNomeCartao } from './pagamentoParcialInputUtils';

describe('pagamentoParcialInputUtils', () => {
  describe('formatarValorMonetario', () => {
    it('deve formatar valor corretamente com vírgula decimal', () => {
      expect(formatarValorMonetario(100.5)).toBe('100,50');
      expect(formatarValorMonetario(100)).toBe('100,00');
      expect(formatarValorMonetario(0)).toBe('0,00');
      expect(formatarValorMonetario(1234.56)).toBe('1.234,56');
    });

    it('deve formatar valor pequeno corretamente', () => {
      expect(formatarValorMonetario(10)).toBe('10,00');
      expect(formatarValorMonetario(0.01)).toBe('0,01');
    });
  });

  describe('validarValorPagamentoParcial', () => {
    const valorMinimo = 10;
    const valorRestante = 100;

    it('deve retornar erro quando valor é inválido', () => {
      expect(validarValorPagamentoParcial('', valorMinimo, valorRestante)).toEqual({
        valido: false,
        erro: 'Digite um valor válido'
      });
    });

    it('deve retornar erro quando valor é NaN', () => {
      expect(validarValorPagamentoParcial('abc', valorMinimo, valorRestante)).toEqual({
        valido: false,
        erro: 'Digite um valor válido'
      });
    });

    it('deve retornar erro quando valor é zero ou negativo', () => {
      expect(validarValorPagamentoParcial('0', valorMinimo, valorRestante)).toEqual({
        valido: false,
        erro: 'Digite um valor válido'
      });
      expect(validarValorPagamentoParcial('-10', valorMinimo, valorRestante)).toEqual({
        valido: false,
        erro: 'Digite um valor válido'
      });
    });

    it('deve retornar erro quando valor é menor que o mínimo', () => {
      expect(validarValorPagamentoParcial('5', valorMinimo, valorRestante)).toEqual({
        valido: false,
        erro: 'Valor mínimo por cartão é R$ 10,00'
      });
    });

    it('deve retornar erro quando valor excede o restante', () => {
      expect(validarValorPagamentoParcial('150', valorMinimo, valorRestante)).toEqual({
        valido: false,
        erro: 'Valor não pode exceder o restante de R$ 100,00'
      });
    });

    it('deve retornar válido quando valor está dentro dos limites', () => {
      expect(validarValorPagamentoParcial('50', valorMinimo, valorRestante)).toEqual({
        valido: true,
        erro: null
      });
      expect(validarValorPagamentoParcial('10', valorMinimo, valorRestante)).toEqual({
        valido: true,
        erro: null
      });
      expect(validarValorPagamentoParcial('100', valorMinimo, valorRestante)).toEqual({
        valido: true,
        erro: null
      });
    });
  });

  describe('calcularValorRestante', () => {
    it('deve calcular valor restante corretamente', () => {
      expect(calcularValorRestante(100, 0)).toBe(100);
      expect(calcularValorRestante(100, 50)).toBe(50);
      expect(calcularValorRestante(100, 100)).toBe(0);
    });

    it('deve retornar zero quando valor pago excede total', () => {
      expect(calcularValorRestante(100, 150)).toBe(-50);
    });
  });

  describe('formatarNomeCartao', () => {
    it('deve retornar nome do cartão quando disponível', () => {
      expect(formatarNomeCartao('Cartão Visa', 'uuid-123')).toBe('Cartão Visa');
    });

    it('deve formatar UUID quando nome não disponível', () => {
      expect(formatarNomeCartao(undefined, 'abc123def456')).toBe('Cartão abc123de...');
      expect(formatarNomeCartao(null, 'xyz789')).toBe('Cartão xyz789...');
    });

    it('deve tratar string vazia', () => {
      expect(formatarNomeCartao('', 'abc123')).toBe('Cartão abc123...');
    });
  });
});
