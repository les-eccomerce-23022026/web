export interface ItemCarrinho {
  uuid: string;
  imagem: string;
  titulo: string;
  isbn: string;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
}

export interface FretePadrao {
  valor: number;
  prazo: string;
}

export interface ResumoCarrinho {
  subtotal: number;
  frete: number;
  total: number;
}

export interface Carrinho {
  itens: ItemCarrinho[];
  fretePadrao: FretePadrao;
  resumo: ResumoCarrinho;
}
