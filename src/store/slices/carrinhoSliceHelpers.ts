import type { ICarrinho, IItemCarrinho } from '@/interfaces/carrinho';

export function recalcularResumoCarrinho(carrinho: ICarrinho) {
  const subtotal = carrinho.itens.reduce((acumulado, item) => acumulado + item.subtotal, 0);
  const frete = carrinho.itens.length ? carrinho.fretePadrao.valor : 0;
  carrinho.resumo.subtotal = subtotal;
  carrinho.resumo.frete = frete;
  carrinho.resumo.total = subtotal + frete;
}

export function adicionarOuAtualizarItemCarrinho(carrinho: ICarrinho, itemNovo: IItemCarrinho) {
  const itemExistente = carrinho.itens.find((item) => item.uuid === itemNovo.uuid);
  if (itemExistente) {
    itemExistente.quantidade += itemNovo.quantidade;
    itemExistente.subtotal = itemExistente.quantidade * itemExistente.precoUnitario;
    recalcularResumoCarrinho(carrinho);
    return;
  }
  carrinho.itens.push(itemNovo);
  recalcularResumoCarrinho(carrinho);
}

export function removerItemCarrinho(carrinho: ICarrinho, itemUuid: string) {
  carrinho.itens = carrinho.itens.filter((item) => item.uuid !== itemUuid);
  recalcularResumoCarrinho(carrinho);
}

export function atualizarQuantidadeItemCarrinho(
  carrinho: ICarrinho,
  payload: { uuid: string; quantidade: number },
) {
  const item = carrinho.itens.find((linha) => linha.uuid === payload.uuid);
  if (!item || payload.quantidade <= 0) return;
  item.quantidade = payload.quantidade;
  item.subtotal = item.quantidade * item.precoUnitario;
  recalcularResumoCarrinho(carrinho);
}

export function limparItensCarrinho(carrinho: ICarrinho) {
  carrinho.itens = [];
  carrinho.resumo.subtotal = 0;
  carrinho.resumo.frete = 0;
  carrinho.resumo.total = 0;
}
