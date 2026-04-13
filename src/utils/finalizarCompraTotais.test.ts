import { describe, it, expect } from 'vitest';
import { montarLiquidaçõesEfetivasFinalizarCompra } from './finalizarCompraTotais';
import type { IPagamentoParcial } from '@/interfaces/pagamento';
import type { OpcoesFinalizarCheckout } from '@/types/checkout';

describe('finalizarCompraTotais', () => {
  describe('montarLiquidaçõesEfetivasFinalizarCompra', () => {
    it('deve retornar pagamentos se já existirem na lista', () => {
      const parcelas: IPagamentoParcial[] = [{ referenciaMeioPagamento: 'pix', valor: 100 }];
      const resultado = montarLiquidaçõesEfetivasFinalizarCompra(undefined, 100, parcelas);
      expect(resultado).toEqual(parcelas);
    });

    it('deve usar cartão salvo se a lista estiver vazia e houver cartaoSalvoUuid', () => {
      const opcoes = { cartaoSalvoUuid: 'uuid-123' } as OpcoesFinalizarCheckout;
      const resultado = montarLiquidaçõesEfetivasFinalizarCompra(opcoes, 100, []);
      expect(resultado).toEqual([
        { referenciaMeioPagamento: 'uuid-123', valor: 100, parcelasCartao: 1 }
      ]);
    });

    it('deve usar novo cartão se a lista estiver vazia e houver novoCartao', () => {
      const opcoes = { novoCartao: {} } as OpcoesFinalizarCheckout;
      const resultado = montarLiquidaçõesEfetivasFinalizarCompra(opcoes, 100, []);
      expect(resultado).toEqual([
        { referenciaMeioPagamento: 'novo', valor: 100, parcelasCartao: 1 }
      ]);
    });

    it('deve retornar lista vazia se não houver opções e lista estiver vazia', () => {
      const resultado = montarLiquidaçõesEfetivasFinalizarCompra(undefined, 100, []);
      expect(resultado).toEqual([]);
    });
  });
});
