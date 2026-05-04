import type { AppDispatch } from '@/store';
import {
  adicionarItem,
  removerItem,
  atualizarQuantidade,
  sincronizarLinhaCarrinho,
} from '@/store/slices/carrinhoSlice';
import type { ILivro } from '@/interfaces/livro';

export function adicionarUmAoCarrinho(
  dispatch: AppDispatch,
  usarLocal: boolean,
  livro: ILivro,
  quantidadeAtual: number,
): Promise<any> | void {
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
  return dispatch(sincronizarLinhaCarrinho({ livroUuid: livro.uuid, quantidade: quantidadeAtual + 1 }));
}

export function definirQuantidadeCarrinho(
  dispatch: AppDispatch,
  usarLocal: boolean,
  livro: ILivro,
  novaQuantidade: number,
): Promise<any> | void {
  if (novaQuantidade <= 0) {
    if (usarLocal) {
      dispatch(removerItem(livro.uuid));
    } else {
      return dispatch(sincronizarLinhaCarrinho({ livroUuid: livro.uuid, quantidade: 0 }));
    }
    return;
  }
  if (usarLocal) {
    dispatch(atualizarQuantidade({ uuid: livro.uuid, quantidade: novaQuantidade }));
  } else {
    return dispatch(sincronizarLinhaCarrinho({ livroUuid: livro.uuid, quantidade: novaQuantidade }));
  }
}
