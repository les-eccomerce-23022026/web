import { describe, expect, it } from 'vitest';
import {
  filtrarCuponsNaoAplicados,
  formatarValorCupom,
  formatarValorSugestaoCupom,
  validarCodigoCupom,
} from './cupomInputUtils';
import type { ICupomAplicado, ICupomDisponivel } from '@/interfaces/pagamento';

const cupomPromocional: ICupomDisponivel = {
  uuid: 'cupom-1',
  codigo: 'PROMO10',
  tipo: 'promocional',
  valor: 10,
  descricao: 'Promo 10',
};

const cupomTroca: ICupomDisponivel = {
  uuid: 'cupom-2',
  codigo: 'TROCA15',
  tipo: 'troca',
  valor: 15,
  descricao: 'Troca 15',
};

describe('cupomInputUtils', () => {
  it('deve validar erro para codigo vazio', () => {
    const resultado = validarCodigoCupom({
      codigoDigitado: '  ',
      cuponsDisponiveis: [cupomPromocional],
    });

    expect(resultado).toEqual({ erro: 'Digite o código do cupom' });
  });

  it('deve validar erro para cupom invalido', () => {
    const resultado = validarCodigoCupom({
      codigoDigitado: 'INEXISTENTE',
      cuponsDisponiveis: [cupomPromocional],
    });

    expect(resultado).toEqual({ erro: 'Cupom inválido ou expirado' });
  });

  it('deve impedir segundo cupom promocional', () => {
    const cupomAplicado: ICupomAplicado = {
      uuid: 'aplicado-1',
      codigo: 'PROMO20',
      tipo: 'promocional',
      valor: 20,
    };

    const resultado = validarCodigoCupom({
      codigoDigitado: 'PROMO10',
      cuponsDisponiveis: [cupomPromocional],
      cupomPromocionalAplicado: cupomAplicado,
    });

    expect(resultado).toEqual({ erro: 'Apenas um cupom promocional é permitido por compra' });
  });

  it('deve filtrar apenas cupons nao aplicados', () => {
    const filtrados = filtrarCuponsNaoAplicados([cupomPromocional, cupomTroca], [{
      uuid: 'cupom-1',
      codigo: 'PROMO10',
      tipo: 'promocional',
      valor: 10,
    }]);

    expect(filtrados).toHaveLength(1);
    expect(filtrados[0].codigo).toBe('TROCA15');
  });

  it('deve formatar valores de cupom para lista e sugestao', () => {
    expect(formatarValorCupom(cupomPromocional)).toBe('- 10%');
    expect(formatarValorCupom(cupomTroca)).toBe('- R$ 15,00');
    expect(formatarValorSugestaoCupom(cupomPromocional)).toBe('10% de desconto');
    expect(formatarValorSugestaoCupom(cupomTroca)).toBe('R$ 15,00 de troca');
  });
});
