export interface IItemCarrinho {
  uuid: string;
  imagem: string;
  titulo: string;
  isbn: string;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
  motivoExpiracao?: string;
}

export interface IItemCarrinhoExpirado extends IItemCarrinho {
  motivoExpiracao: string;
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
  itensExpirados?: IItemCarrinho[];
  fretePadrao: IFretePadrao;
  resumo: IResumoCarrinho;
}
