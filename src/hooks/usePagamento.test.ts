import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePagamento } from './usePagamento';

const mocksPagamentoService = vi.hoisted(() => ({
  obterPagamentoInfo: vi.fn(),
  definirMetodoLiquidacao: vi.fn(),
  registrarIntencaoPagamento: vi.fn(),
  solicitarAutorizacaoFinanceiraCheckout: vi.fn(),
}));

vi.mock('../services/pagamentoService', () => ({
  PagamentoService: mocksPagamentoService,
}));

vi.mock('../utils/pagamentoMontarPagamentos', () => ({
  montarPagamentosCartaoParaAutorizacao: vi.fn(() => [
    { referenciaMeioPagamento: 'cartao-1', valor: 100 },
  ]),
}));

describe('usePagamento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aplica cupom promocional único e bloqueia segundo promocional', () => {
    const { result } = renderHook(() => usePagamento());

    let primeiroResultado = false;
    let segundoResultado = true;

    act(() => {
      primeiroResultado = result.current.aplicarCupom({
        uuid: 'cupom-1',
        codigo: 'PROMO10',
        tipo: 'promocional',
        valor: 10,
      });
    });

    act(() => {
      segundoResultado = result.current.aplicarCupom({
        uuid: 'cupom-2',
        codigo: 'PROMO20',
        tipo: 'promocional',
        valor: 20,
      });
    });

    expect(primeiroResultado).toBe(true);
    expect(segundoResultado).toBe(false);
    expect(result.current.cuponsAplicados).toHaveLength(1);
    expect(result.current.error?.message).toBe('Apenas um cupom promocional é permitido por compra');
  });

  it('adiciona parcela válida e recusa valor mínimo inválido', () => {
    const { result } = renderHook(() => usePagamento());

    let adicionouParcelaValida = false;
    let adicionouParcelaInvalida = true;

    act(() => {
      adicionouParcelaValida = result.current.adicionarParcelaLiquidacao('cartao-1', 50);
      adicionouParcelaInvalida = result.current.adicionarParcelaLiquidacao('cartao-2', 5);
    });

    expect(adicionouParcelaValida).toBe(true);
    expect(adicionouParcelaInvalida).toBe(false);
    expect(result.current.parcelasLiquidacao).toEqual([{ referenciaMeioPagamento: 'cartao-1', valor: 50 }]);
  });

  it('processa autorização financeira e limpa parcelas ao sucesso', async () => {
    mocksPagamentoService.registrarIntencaoPagamento.mockResolvedValue({
      idIntencao: 'intencao-1',
      segredoConfirmacao: 'segredo-1',
    });
    mocksPagamentoService.solicitarAutorizacaoFinanceiraCheckout.mockResolvedValue({
      sucesso: true,
      pedidoUuid: 'pedido-1',
      status: 'aprovado',
    });
    const { result } = renderHook(() => usePagamento());

    act(() => {
      result.current.definirParcelasLiquidacao([{ referenciaMeioPagamento: 'cartao-1', valor: 100 }]);
    });

    await act(async () => {
      const retorno = await result.current.solicitarAutorizacaoFinanceiraCheckout('venda-1', 100);
      expect(retorno?.sucesso).toBe(true);
    });

    expect(mocksPagamentoService.registrarIntencaoPagamento).toHaveBeenCalledWith(100);
    expect(mocksPagamentoService.solicitarAutorizacaoFinanceiraCheckout).toHaveBeenCalledTimes(1);
    expect(result.current.parcelasLiquidacao).toEqual([]);
  });
});
