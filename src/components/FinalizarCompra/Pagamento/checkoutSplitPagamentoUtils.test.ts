import { describe, expect, it } from 'vitest';
import {
  calcularCobrancaLinhas,
  formatarValorBrl,
  montarTextoRestanteE2e,
} from './checkoutSplitPagamentoUtils';

describe('checkoutSplitPagamentoUtils', () => {
  it('deve calcular 100 por cento quando total apos cupom for zero', () => {
    const resultado = calcularCobrancaLinhas(0, 10);

    expect(resultado.percentualCoberto).toBe(100);
    expect(resultado.alinhado).toBe(false);
  });

  it('deve calcular cobertura parcial e restante corretamente', () => {
    const resultado = calcularCobrancaLinhas(200, 150);

    expect(resultado.percentualCoberto).toBe(75);
    expect(resultado.restante).toBe(50);
    expect(resultado.alinhado).toBe(false);
  });

  it('deve montar texto de restante com prefixo de cupom quando houver cupom aplicado', () => {
    const texto = montarTextoRestanteE2e({
      cuponsAplicados: [{ uuid: 'cupom-1', codigo: 'CUPOM10', tipo: 'promocional', valor: 10 }],
      totalAposCupons: 90,
      somaLinhas: 80,
      alinhado: false,
      restante: 10,
    });

    expect(texto).toContain('Total após cupons');
    expect(texto).toContain('Ajuste de R$ 10,00');
  });

  it('deve formatar valor em padrao brl com virgula', () => {
    expect(formatarValorBrl(19.9)).toBe('19,90');
  });
});
