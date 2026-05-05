import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFinalizarCompra } from './useFinalizarCompra';

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  showError: vi.fn(),
  executarFinalizarCheckout: vi.fn(),
}));

const estadoReduxMock = {
  carrinho: { data: { itens: [{ uuid: 'livro-1' }], resumo: { subtotal: 100 } }, status: 'idle' },
  auth: { user: { uuid: 'cliente-1' } },
  cotacaoFrete: { cotacao: null },
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace, back: mocks.back }),
}));

vi.mock('../store/hooks', () => ({
  useAppDispatch: () => mocks.dispatch,
  useAppSelector: (seletor: (estado: typeof estadoReduxMock) => unknown) => seletor(estadoReduxMock),
}));

vi.mock('./useEntrega', () => ({
  useEntrega: () => ({
    freteSelecionado: null,
    selecionarFrete: vi.fn(),
    calcularFrete: vi.fn(),
    freteCalculado: null,
    loading: false,
    error: null,
    formatarCep: vi.fn(),
    validarCep: vi.fn(),
    hidratarFrete: vi.fn(),
    cepDestino: '',
  }),
}));

vi.mock('./usePagamento', () => ({
  usePagamento: () => ({
    cuponsAplicados: [],
    parcelasLiquidacao: [],
    aplicarCupom: vi.fn(),
    removerCupom: vi.fn(),
    adicionarParcelaLiquidacao: vi.fn(),
    removerParcelaLiquidacao: vi.fn(),
    definirParcelasLiquidacao: vi.fn(),
  }),
}));

vi.mock('../components/Comum/Notification', () => ({
  useNotification: () => ({ showError: mocks.showError }),
}));

vi.mock('../utils/executarFinalizacaoCompra', () => ({
  executarFinalizarCheckout: mocks.executarFinalizarCheckout,
  tratarErroFinalizarCheckout: vi.fn(),
}));

describe('useFinalizarCompra', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exibe erro quando tenta finalizar sem frete selecionado', async () => {
    const { result } = renderHook(() => useFinalizarCompra());

    await act(async () => {
      await result.current.handleFinalizarCompra();
    });

    expect(mocks.showError).toHaveBeenCalledWith('Selecione uma opção de frete.');
    expect(mocks.executarFinalizarCheckout).not.toHaveBeenCalled();
  });
});
