import { describe, it, expect, vi } from 'vitest';
import { executarPagamentosAposCriarVenda } from './finalizarCompraLiquidacaoPagamentos';
import type { IPagamentoService } from '@/services/contracts/pagamentoService';
import type { ICupomAplicado, IPagamentoParcial, ICartaoCreditoInput } from '@/interfaces/pagamento';
import type { OpcoesFinalizarCheckout } from '@/types/checkout';

describe('finalizarCompraLiquidacaoPagamentos', () => {
  const mockPagamentoService = {
    selecionarPagamentoLiquida: vi.fn().mockResolvedValue({ id: 'pag-123' }),
    solicitarAutorizacaoFinanceira: vi.fn().mockResolvedValue({}),
  } as unknown as IPagamentoService;

  it('deve processar cupons promocionais e de troca corretamente', async () => {
    const params = {
      pagamentoService: mockPagamentoService,
      vendaUuid: 'venda-123',
      subtotal: 100,
      frete: 10,
      cuponsAplicados: [
        { uuid: 'c1', tipo: 'promocional', valor: 10, codigo: 'DESC10' },
        { uuid: 'c2', tipo: 'troca', valor: 50, codigo: 'TROCA50' }
      ] as ICupomAplicado[],
      pagamentosEfetivos: [
        { referenciaMeioPagamento: 'novo', valor: 50, parcelasCartao: 1 }
      ] as IPagamentoParcial[],
      opcoesOpcional: { novoCartao: { numero: '4242 4242 4242 4242', nomeTitular: 'JOAO', validade: '12/30', cvv: '123', bandeira: 'Visa' } as ICartaoCreditoInput } as OpcoesFinalizarCheckout,
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
