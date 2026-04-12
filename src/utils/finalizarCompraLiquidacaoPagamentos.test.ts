import { describe, it, expect, vi } from 'vitest';
import { executarPagamentosAposCriarVenda } from './finalizarCompraLiquidacaoPagamentos';

describe('finalizarCompraLiquidacaoPagamentos', () => {
  const mockPagamentoService = {
    selecionarPagamentoLiquida: vi.fn().mockResolvedValue({ id: 'pag-123' }),
    solicitarAutorizacaoFinanceira: vi.fn().mockResolvedValue({}),
  };

  it('deve processar cupons promocionais e de troca corretamente', async () => {
    const params = {
      pagamentoService: mockPagamentoService as any,
      vendaUuid: 'venda-123',
      subtotal: 100,
      frete: 10,
      cuponsAplicados: [
        { tipo: 'promocional', valor: 10, codigo: 'DESC10' },
        { tipo: 'troca', valor: 50, codigo: 'TROCA50' }
      ] as any,
      pagamentosEfetivos: [
        { referenciaMeioPagamento: 'novo', valor: 50, parcelasCartao: 1 }
      ] as any,
      opcoesOpcional: { novoCartao: { numero: '4242', nomeTitular: 'JOAO', validade: '12/30', bandeira: 'Visa' } } as any,
      cartoesSalvos: []
    };

    await executarPagamentosAposCriarVenda(params);

    // Verifica cupom promocional
    expect(mockPagamentoService.selecionarPagamentoLiquida).toHaveBeenCalledWith(expect.objectContaining({
      tipoPagamento: 'cupom_promocional',
      valor: 10, // 10% de 100
      detalhesCupom: 'DESC10'
    }));

    // Verifica cupom de troca
    expect(mockPagamentoService.selecionarPagamentoLiquida).toHaveBeenCalledWith(expect.objectContaining({
      tipoPagamento: 'cupom_troca',
      valor: 50,
      detalhesCupom: 'TROCA50'
    }));
  });
});
