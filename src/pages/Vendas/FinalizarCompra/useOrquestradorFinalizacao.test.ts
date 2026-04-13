import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOrquestradorFinalizacao } from './useOrquestradorFinalizacao';
import type { ICheckoutInfo } from '@/interfaces/checkout';

describe('useOrquestradorFinalizacao (TDD)', () => {
  const MOCK_CHECKOUT: Partial<ICheckoutInfo> = {
    cartoesSalvos: [{ uuid: 'c1', bandeira: 'Visa', ultimosDigitosCartao: '1234', nomeCliente: 'Teste', nomeImpresso: 'Teste', validade: '12/30' }],
    enderecosDisponiveis: [{ uuid: 'e1', principal: true, logradouro: 'Rua Teste', numero: '123', bairro: 'Bairro', cidade: 'Cidade', estado: 'SP', cep: '00000-000', apelido: 'Casa', complemento: '', tipo: 'entrega' }],
  };

  const MOCK_RESUMO = {
    total: 110,
  };

  it('deve inicializar com uma linha de pagamento cobrindo o total', () => {
    const { result } = renderHook(() => useOrquestradorFinalizacao({
      dadosCheckout: MOCK_CHECKOUT as ICheckoutInfo,
      resumoFinanceiro: MOCK_RESUMO,
    }));

    expect(result.current.composicaoPagamento).toHaveLength(1);
    expect(result.current.composicaoPagamento[0].valor).toBe(110);
    expect(result.current.isSaldoCoberto).toBe(true);
  });

  it('deve atualizar automaticamente o valor da linha única quando o total do pedido mudar (sem useEffect)', () => {
    let resumo = { ...MOCK_RESUMO };
    const { result, rerender } = renderHook(({ res }) => useOrquestradorFinalizacao({
      dadosCheckout: MOCK_CHECKOUT as ICheckoutInfo,
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
      dadosCheckout: MOCK_CHECKOUT as ICheckoutInfo,
      resumoFinanceiro: MOCK_RESUMO,
    }));

    act(() => {
      result.current.adicionarMeioPagamento('pix');
    });

    const idPix = result.current.composicaoPagamento[1].id;
    const idOriginal = result.current.composicaoPagamento[0].id;

    act(() => {
      result.current.atualizarValorMeio(idPix, 50);
      result.current.atualizarValorMeio(idOriginal, 40);
    });

    // 50 + 40 = 90. Faltam 20 para 110.
    expect(result.current.isSaldoCoberto).toBe(false);
    expect(result.current.saldoDevedor).toBe(20);
  });
});
