import type { AppDispatch } from '@/store';
import {
  adicionarItem,
  removerItem,
  atualizarQuantidade,
  sincronizarLinhaCarrinho,
} from '@/store/slices/carrinhoSlice';
import type { ILivro } from '@/interfaces/ILivro';

export function adicionarUmAoCarrinho(
  dispatch: AppDispatch,
  usarLocal: boolean,
  livro: ILivro,
  quantidadeAtual: number,
): void {
  if (usarLocal) {
    dispatch(
      adicionarItem({
        uuid: livro.uuid,
        imagem: livro.imagem || '',
        titulo: livro.titulo,
        isbn: livro.isbn || '',
        precoUnitario: livro.preco,
        quantidade: 1,
        subtotal: livro.preco,
      }),
    );
    return;
  }
  void dispatch(sincronizarLinhaCarrinho({ livroUuid: livro.uuid, quantidade: quantidadeAtual + 1 }));
}

export function definirQuantidadeCarrinho(
  dispatch: AppDispatch,
  usarLocal: boolean,
  livro: ILivro,
  novaQuantidade: number,
): void {
  if (novaQuantidade <= 0) {
    if (usarLocal) {
      dispatch(removerItem(livro.uuid));
    } else {
      void dispatch(sincronizarLinhaCarrinho({ livroUuid: livro.uuid, quantidade: 0 }));
    }
    return;
  }
  if (usarLocal) {
    dispatch(atualizarQuantidade({ uuid: livro.uuid, quantidade: novaQuantidade }));
  } else {
    void dispatch(sincronizarLinhaCarrinho({ livroUuid: livro.uuid, quantidade: novaQuantidade }));
  }
}
