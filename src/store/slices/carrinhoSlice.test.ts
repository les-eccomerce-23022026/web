import { describe, expect, it } from 'vitest';
import reducer, {
  adicionarItem,
  atualizarQuantidade,
  limparCarrinho,
  removerItem,
} from './carrinhoSlice';
import { criarCarrinhoVazio } from './testDependencias';

function criarEstadoBase() {
  return {
    data: criarCarrinhoVazio(),
    status: 'idle' as const,
    error: null as string | null,
  };
}

describe('carrinhoSlice reducer', () => {
  it('adiciona item novo e recalcula resumo', () => {
    const estado = criarEstadoBase();
    const proximoEstado = reducer(
      estado,
      adicionarItem({
        uuid: 'livro-1',
        imagem: '',
        titulo: 'Livro 1',
        isbn: 'isbn-1',
        precoUnitario: 50,
        quantidade: 1,
        subtotal: 50,
      }),
    );

    expect(proximoEstado.data?.itens).toHaveLength(1);
    expect(proximoEstado.data?.resumo).toEqual({ subtotal: 50, frete: 15, total: 65 });
  });

  it('atualiza quantidade existente e recalcula subtotal total', () => {
    const estadoComItem = reducer(
      criarEstadoBase(),
      adicionarItem({
        uuid: 'livro-1',
        imagem: '',
        titulo: 'Livro 1',
        isbn: 'isbn-1',
        precoUnitario: 50,
        quantidade: 1,
        subtotal: 50,
      }),
    );

    const proximoEstado = reducer(
      estadoComItem,
      atualizarQuantidade({ uuid: 'livro-1', quantidade: 3 }),
    );

    expect(proximoEstado.data?.itens[0].subtotal).toBe(150);
    expect(proximoEstado.data?.resumo).toEqual({ subtotal: 150, frete: 15, total: 165 });
  });

  it('remove item e zera frete quando carrinho fica vazio', () => {
    const estadoComItem = reducer(
      criarEstadoBase(),
      adicionarItem({
        uuid: 'livro-1',
        imagem: '',
        titulo: 'Livro 1',
        isbn: 'isbn-1',
        precoUnitario: 50,
        quantidade: 1,
        subtotal: 50,
      }),
    );

    const proximoEstado = reducer(estadoComItem, removerItem('livro-1'));
    expect(proximoEstado.data?.itens).toEqual([]);
    expect(proximoEstado.data?.resumo).toEqual({ subtotal: 0, frete: 0, total: 0 });
  });

  it('limpa carrinho sem remover estrutura base', () => {
    const estadoComItem = reducer(
      criarEstadoBase(),
      adicionarItem({
        uuid: 'livro-1',
        imagem: '',
        titulo: 'Livro 1',
        isbn: 'isbn-1',
        precoUnitario: 50,
        quantidade: 1,
        subtotal: 50,
      }),
    );

    const proximoEstado = reducer(estadoComItem, limparCarrinho());
    expect(proximoEstado.data?.itens).toEqual([]);
    expect(proximoEstado.data?.fretePadrao.valor).toBe(15);
    expect(proximoEstado.data?.resumo).toEqual({ subtotal: 0, frete: 0, total: 0 });
  });
});
