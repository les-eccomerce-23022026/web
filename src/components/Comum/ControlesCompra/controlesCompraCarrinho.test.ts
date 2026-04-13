import { describe, it, expect, vi } from 'vitest';
import { definirQuantidadeCarrinho } from './controlesCompraCarrinho';
import { removerItem, atualizarQuantidade, sincronizarLinhaCarrinho } from '@/store/slices/carrinhoSlice';
import type { ILivro } from '@/interfaces/livro';

// Mocking the actions
vi.mock('@/store/slices/carrinhoSlice', () => ({
  removerItem: vi.fn((uuid) => ({ type: 'remover', payload: uuid })),
  atualizarQuantidade: vi.fn((payload) => ({ type: 'atualizar', payload })),
  sincronizarLinhaCarrinho: vi.fn((payload) => ({ type: 'sincronizar', payload })),
}));

describe('controlesCompraCarrinho', () => {
  const dispatch = vi.fn();
  const livro = { uuid: 'livro-123', titulo: 'Livro Teste', preco: 10, imagem: '', isbn: '' } as ILivro;

  it('deve remover item localmente quando quantidade <= 0 e usarLocal for true', () => {
    definirQuantidadeCarrinho(dispatch, true, livro, 0);
    expect(removerItem).toHaveBeenCalledWith(livro.uuid);
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'remover' }));
  });

  it('deve sincronizar remoção quando quantidade <= 0 e usarLocal for false', () => {
    definirQuantidadeCarrinho(dispatch, false, livro, 0);
    expect(sincronizarLinhaCarrinho).toHaveBeenCalledWith({ livroUuid: livro.uuid, quantidade: 0 });
  });

  it('deve atualizar quantidade localmente quando usarLocal for true', () => {
    definirQuantidadeCarrinho(dispatch, true, livro, 5);
    expect(atualizarQuantidade).toHaveBeenCalledWith({ uuid: livro.uuid, quantidade: 5 });
  });

  it('deve sincronizar quantidade quando usarLocal for false', () => {
    definirQuantidadeCarrinho(dispatch, false, livro, 5);
    expect(sincronizarLinhaCarrinho).toHaveBeenCalledWith({ livroUuid: livro.uuid, quantidade: 5 });
  });
});
