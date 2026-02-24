export interface IItemCarrinho {
  uuid: string;
  imagem: string;
  titulo: string;
  isbn: string;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
}

export interface IFretePadrao {
  valor: number;
  prazo: string;
}

export interface IResumoCarrinho {
  subtotal: number;
  frete: number;
  total: number;
}

export interface ICarrinho {
  itens: IItemCarrinho[];
  fretePadrao: IFretePadrao;
  resumo: IResumoCarrinho;
}
