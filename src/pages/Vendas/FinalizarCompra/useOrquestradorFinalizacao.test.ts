import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOrquestradorFinalizacao } from './useOrquestradorFinalizacao';

describe('useOrquestradorFinalizacao (TDD)', () => {
  const MOCK_CHECKOUT = {
    cartoesSalvos: [{ uuid: 'c1', bandeira: 'Visa', ultimosDigitos: '1234' }],
    enderecosDisponiveis: [{ uuid: 'e1', principal: true }],
  };

  const MOCK_RESUMO = {
    subtotal: 100,
    frete: 20,
    descontoCupons: 10,
    total: 110, // 100 + 20 - 10
  };

  it('deve inicializar com uma linha de pagamento cobrindo o total', () => {
    const { result } = renderHook(() => useOrquestradorFinalizacao({
      dadosCheckout: MOCK_CHECKOUT as any,
      resumoFinanceiro: MOCK_RESUMO,
    }));

    expect(result.current.composicaoPagamento).toHaveLength(1);
    expect(result.current.composicaoPagamento[0].valor).toBe(110);
    expect(result.current.isSaldoCoberto).toBe(true);
  });

  it('deve atualizar automaticamente o valor da linha única quando o total do pedido mudar (sem useEffect)', () => {
    let resumo = { ...MOCK_RESUMO };
    const { result, rerender } = renderHook(({ res }) => useOrquestradorFinalizacao({
      dadosCheckout: MOCK_CHECKOUT as any,
      resumoFinanceiro: res,
    }), {
      initialProps: { res: resumo }
    });

    expect(result.current.composicaoPagamento[0].valor).toBe(110);

    // Simula mudança no frete aumentando o total para 130
    resumo = { ...resumo, total: 130 };
    rerender({ res: resumo });

    expect(result.current.composicaoPagamento[0].valor).toBe(130);
  });

  it('deve validar se o pagamento cobre o saldo devedor', () => {
    const { result } = renderHook(() => useOrquestradorFinalizacao({
      dadosCheckout: MOCK_CHECKOUT as any,
      resumoFinanceiro: MOCK_RESUMO,
    }));

    act(() => {
      // Adiciona uma linha de PIX de 50 reais (Total é 110)
      result.current.adicionarMeioPagamento('pix');
      result.current.atualizarValorMeio(result.current.composicaoPagamento[1].id, 50);
      // Ajusta a primeira linha para 40
      result.current.atualizarValorMeio(result.current.composicaoPagamento[0].id, 40);
    });

    // 50 + 40 = 90. Faltam 20 para 110.
    expect(result.current.isSaldoCoberto).toBe(false);
    expect(result.current.saldoDevedor).toBe(20);
  });
});
