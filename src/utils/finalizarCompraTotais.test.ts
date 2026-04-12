import { describe, it, expect } from 'vitest';
import { montarLiquidaçõesEfetivasFinalizarCompra } from './finalizarCompraTotais';

describe('finalizarCompraTotais', () => {
  describe('montarLiquidaçõesEfetivasFinalizarCompra', () => {
    it('deve retornar pagamentos se já existirem na lista', () => {
      const parcelas = [{ referenciaMeioPagamento: 'pix', valor: 100 }];
      const resultado = montarLiquidaçõesEfetivasFinalizarCompra(undefined, 100, parcelas as any);
      expect(resultado).toEqual(parcelas);
    });

    it('deve usar cartão salvo se a lista estiver vazia e houver cartaoSalvoUuid', () => {
      const opcoes = { cartaoSalvoUuid: 'uuid-123' };
      const resultado = montarLiquidaçõesEfetivasFinalizarCompra(opcoes as any, 100, []);
      expect(resultado).toEqual([
        { referenciaMeioPagamento: 'uuid-123', valor: 100, parcelasCartao: 1 }
      ]);
    });

    it('deve usar novo cartão se a lista estiver vazia e houver novoCartao', () => {
      const opcoes = { novoCartao: true };
      const resultado = montarLiquidaçõesEfetivasFinalizarCompra(opcoes as any, 100, []);
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
