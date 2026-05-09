/**
 * Testes unitários para opcoesParcelamentoCartao
 * Valida RN0069: Compras abaixo de R$ 80,00 não são elegíveis para parcelamento
 */

import {
  opcoesParcelamentoCartaoParaValor,
  elegivelParaParcelamento,
} from './opcoesParcelamentoCartao';
import { POLITICA_PARCELAMENTO_CARTAO_PADRAO } from '../interfaces/pagamento';

describe('opcoesParcelamentoCartaoParaValor', () => {
  const politicaPadrao = POLITICA_PARCELAMENTO_CARTAO_PADRAO;

  describe('RN0069 - Valor mínimo para parcelamento', () => {
    it('deve retornar apenas opção à vista quando valor < R$ 80,00', () => {
      const valor = 79.99;
      const opcoes = opcoesParcelamentoCartaoParaValor(valor, politicaPadrao);

      expect(opcoes).toHaveLength(1);
      expect(opcoes[0].quantidadeParcelas).toBe(1);
      expect(opcoes[0].rotuloSelect).toContain('à vista');
    });

    it('deve retornar apenas opção à vista quando valor = R$ 79,99', () => {
      const valor = 79.99;
      const opcoes = opcoesParcelamentoCartaoParaValor(valor, politicaPadrao);

      expect(opcoes).toHaveLength(1);
      expect(opcoes[0].quantidadeParcelas).toBe(1);
    });

    it('deve retornar múltiplas opções de parcelamento quando valor >= R$ 80,00', () => {
      const valor = 80.00;
      const opcoes = opcoesParcelamentoCartaoParaValor(valor, politicaPadrao);

      expect(opcoes.length).toBeGreaterThan(1);
      expect(opcoes[0].quantidadeParcelas).toBe(1);
      expect(opcoes[1].quantidadeParcelas).toBe(2);
    });

    it('deve retornar múltiplas opções quando valor > R$ 80,00', () => {
      const valor = 100.00;
      const opcoes = opcoesParcelamentoCartaoParaValor(valor, politicaPadrao);

      expect(opcoes.length).toBeGreaterThan(1);
    });

    it('deve retornar opção à vista para valor zero', () => {
      const valor = 0;
      const opcoes = opcoesParcelamentoCartaoParaValor(valor, politicaPadrao);

      expect(opcoes).toHaveLength(1);
      expect(opcoes[0].quantidadeParcelas).toBe(1);
    });

    it('deve retornar opção à vista para valor negativo', () => {
      const valor = -10;
      const opcoes = opcoesParcelamentoCartaoParaValor(valor, politicaPadrao);

      expect(opcoes).toHaveLength(1);
      expect(opcoes[0].quantidadeParcelas).toBe(1);
    });
  });

  describe('Cálculo de parcelas', () => {
    it('deve calcular corretamente valor da parcela para 2x', () => {
      const valor = 100.00;
      const opcoes = opcoesParcelamentoCartaoParaValor(valor, politicaPadrao);

      const opcao2x = opcoes.find((o) => o.quantidadeParcelas === 2);
      expect(opcao2x).toBeDefined();
      expect(opcao2x?.valorParcela).toBe(50.00);
    });

    it('deve calcular corretamente valor da parcela para 3x', () => {
      const valor = 120.00;
      const opcoes = opcoesParcelamentoCartaoParaValor(valor, politicaPadrao);

      const opcao3x = opcoes.find((o) => o.quantidadeParcelas === 3);
      expect(opcao3x).toBeDefined();
      expect(opcao3x?.valorParcela).toBe(40.00);
    });

    it('deve marcar parcelas sem juros corretamente', () => {
      const valor = 100.00;
      const opcoes = opcoesParcelamentoCartaoParaValor(valor, politicaPadrao);

      const opcao1x = opcoes.find((o) => o.quantidadeParcelas === 1);
      const opcao2x = opcoes.find((o) => o.quantidadeParcelas === 2);
      const opcao6x = opcoes.find((o) => o.quantidadeParcelas === 6);
      const opcao7x = opcoes.find((o) => o.quantidadeParcelas === 7);

      expect(opcao1x?.comJuros).toBe(false);
      expect(opcao2x?.comJuros).toBe(false);
      expect(opcao6x?.comJuros).toBe(false);
      expect(opcao7x?.comJuros).toBe(true);
    });

    it('deve respeitar parcelasSemJuros da política', () => {
      const valor = 100.00;
      const politicaCustom = {
        parcelasMaximas: 12,
        parcelasSemJuros: 3,
      };
      const opcoes = opcoesParcelamentoCartaoParaValor(valor, politicaCustom);

      const opcao3x = opcoes.find((o) => o.quantidadeParcelas === 3);
      const opcao4x = opcoes.find((o) => o.quantidadeParcelas === 4);

      expect(opcao3x?.comJuros).toBe(false);
      expect(opcao4x?.comJuros).toBe(true);
    });
  });

  describe('Formatação de rótulos', () => {
    it('deve formatar corretamente rótulo à vista', () => {
      const valor = 100.00;
      const opcoes = opcoesParcelamentoCartaoParaValor(valor, politicaPadrao);

      expect(opcoes[0].rotuloSelect).toBe('1x de R$ 100,00 (à vista) sem juros');
    });

    it('deve formatar corretamente rótulo parcelado sem juros', () => {
      const valor = 100.00;
      const opcoes = opcoesParcelamentoCartaoParaValor(valor, politicaPadrao);

      const opcao2x = opcoes.find((o) => o.quantidadeParcelas === 2);
      expect(opcao2x?.rotuloSelect).toBe('2x de R$ 50,00 sem juros');
    });

    it('deve formatar corretamente rótulo parcelado com juros', () => {
      const valor = 100.00;
      const opcoes = opcoesParcelamentoCartaoParaValor(valor, politicaPadrao);

      const opcao7x = opcoes.find((o) => o.quantidadeParcelas === 7);
      expect(opcao7x?.rotuloSelect).toContain('com juros');
    });
  });
});

describe('elegivelParaParcelamento', () => {
  describe('RN0069 - Valor mínimo R$ 80,00', () => {
    it('deve retornar false para valor abaixo de R$ 80,00', () => {
      expect(elegivelParaParcelamento(79.99)).toBe(false);
      expect(elegivelParaParcelamento(50.00)).toBe(false);
      expect(elegivelParaParcelamento(0)).toBe(false);
    });

    it('deve retornar true para valor igual a R$ 80,00', () => {
      expect(elegivelParaParcelamento(80.00)).toBe(true);
    });

    it('deve retornar true para valor acima de R$ 80,00', () => {
      expect(elegivelParaParcelamento(80.01)).toBe(true);
      expect(elegivelParaParcelamento(100.00)).toBe(true);
      expect(elegivelParaParcelamento(1000.00)).toBe(true);
    });

    it('deve retornar false para valor negativo', () => {
      expect(elegivelParaParcelamento(-10)).toBe(false);
    });
  });
});
