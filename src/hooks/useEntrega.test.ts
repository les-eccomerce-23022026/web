import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formatarCep, useEntrega, validarCep } from './useEntrega';

const mocksEntregaService = vi.hoisted(() => ({
  calcularFrete: vi.fn(),
  cadastrarEntrega: vi.fn(),
}));

vi.mock('../services/api/entregaServiceApi', () => ({
  EntregaServiceApi: class {
    calcularFrete = mocksEntregaService.calcularFrete;
    cadastrarEntrega = mocksEntregaService.cadastrarEntrega;
  },
}));

describe('useEntrega', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('valida e formata cep corretamente', () => {
    expect(validarCep('01001-000')).toBe(true);
    expect(validarCep('0100')).toBe(false);
    expect(formatarCep('01001000')).toBe('01001-000');
  });

  it('calcula frete com sucesso para cep válido', async () => {
    const freteCalculado = {
      opcoes: [{ uuid: 'frete-1', tipo: 'SEDEX', valor: 20, prazo: '2 dias' }],
      cepOrigem: '01001-000',
      pesoTotal: 1,
    };
    mocksEntregaService.calcularFrete.mockResolvedValue(freteCalculado);
    const { result } = renderHook(() => useEntrega());

    await act(async () => {
      const retorno = await result.current.calcularFrete('01001000', 1, 100);
      expect(retorno).toEqual(freteCalculado);
    });

    expect(mocksEntregaService.calcularFrete).toHaveBeenCalledWith({
      cepDestino: '01001000',
      peso: 1,
      valorTotal: 100,
    });
    expect(result.current.freteCalculado).toEqual(freteCalculado);
    expect(result.current.cepDestino).toBe('01001000');
    expect(result.current.error).toBeNull();
  });

  it('retorna erro ao calcular frete com cep inválido', async () => {
    const { result } = renderHook(() => useEntrega());

    await act(async () => {
      const retorno = await result.current.calcularFrete('123');
      expect(retorno).toBeNull();
    });

    expect(mocksEntregaService.calcularFrete).not.toHaveBeenCalled();
    expect(result.current.error?.message).toBe('CEP inválido');
  });

  it('cadastra entrega com frete selecionado', async () => {
    const entregaRetornada = {
      id: 'entrega-1',
      vendaUuid: 'venda-1',
      tipoFrete: 'SEDEX',
      endereco: {
        rua: 'Rua A',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        estado: 'SP',
        cep: '01001-000',
      },
      custo: 20,
      criadoEm: new Date(),
    };
    mocksEntregaService.cadastrarEntrega.mockResolvedValue(entregaRetornada);
    const { result } = renderHook(() => useEntrega());

    act(() => {
      result.current.selecionarFrete({
        uuid: 'frete-1',
        tipo: 'SEDEX',
        valor: 20,
        prazo: '2 dias',
      });
    });

    await act(async () => {
      const retorno = await result.current.cadastrarEntrega('venda-1', {
        rua: 'Rua A',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        estado: 'SP',
        cep: '01001-000',
      });
      expect(retorno).toEqual(entregaRetornada);
    });

    expect(mocksEntregaService.cadastrarEntrega).toHaveBeenCalledTimes(1);
    expect(result.current.entregaCadastrada).toEqual(entregaRetornada);
  });
});
