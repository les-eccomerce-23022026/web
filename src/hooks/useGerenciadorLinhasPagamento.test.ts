import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGerenciadorLinhasPagamento } from './useGerenciadorLinhasPagamento';
import type { LinhaPagamentoCheckout } from '@/types/checkout';

const LINHAS_INICIAIS: LinhaPagamentoCheckout[] = [
  { id: '1', tipo: 'pix', valor: 50 }
];

describe('useGerenciadorLinhasPagamento (TDD)', () => {
  it('deve calcular corretamente a soma e o restante', () => {
    const onLinhasChange = vi.fn();
    const { result } = renderHook(() => useGerenciadorLinhasPagamento({
      totalAposCupons: 100,
      linhas: LINHAS_INICIAIS,
      onLinhasChange
    }));

    expect(result.current.somaLinhas).toBe(50);
    expect(result.current.restante).toBe(50);
    expect(result.current.isAlinhado).toBe(false);
    expect(result.current.percentualCoberto).toBe(50);
  });

  it('deve adicionar uma nova linha de PIX', () => {
    const onLinhasChange = vi.fn();
    const { result } = renderHook(() => useGerenciadorLinhasPagamento({
      totalAposCupons: 100,
      linhas: LINHAS_INICIAIS,
      onLinhasChange
    }));

    act(() => {
      result.current.adicionarLinha('pix');
    });

    expect(onLinhasChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        ...LINHAS_INICIAIS,
        expect.objectContaining({ tipo: 'pix', valor: 0 })
      ])
    );
  });

  it('deve remover uma linha se houver mais de uma', () => {
    const onLinhasChange = vi.fn();
    const DUAS_LINHAS = [...LINHAS_INICIAIS, { id: '2', tipo: 'pix', valor: 50 }];
    const { result } = renderHook(() => useGerenciadorLinhasPagamento({
      totalAposCupons: 100,
      linhas: DUAS_LINHAS,
      onLinhasChange
    }));

    act(() => {
      result.current.removerLinha('2');
    });

    expect(onLinhasChange).toHaveBeenCalledWith([LINHAS_INICIAIS[0]]);
  });

  it('não deve remover a última linha', () => {
    const onLinhasChange = vi.fn();
    const { result } = renderHook(() => useGerenciadorLinhasPagamento({
      totalAposCupons: 100,
      linhas: LINHAS_INICIAIS,
      onLinhasChange
    }));

    act(() => {
      result.current.removerLinha('1');
    });

    expect(onLinhasChange).not.toHaveBeenCalled();
  });
});
