export interface ILivroAdminDetalhe {
  uuid: string;
  titulo: string;
  autor: string;
  isbn: string;
  sinopse?: string;
  imagemUrl?: string;
  ano?: number;
  edicao?: string;
  numeroPaginas?: number;
  altura?: number;
  largura?: number;
  peso?: number;
  profundidade?: number;
  codigoBarras?: string;
  precoVenda: number;
  valorCusto?: number;
  quantidadeEstoque: number;
  status: 'Ativo' | 'Inativo';
  categoria?: string;
  grupoPrecificacao?: string;
}

export interface IPayloadAtualizacaoLivro {
  titulo?: string;
  sinopse?: string;
  imagemUrl?: string;
  ano?: number;
  edicao?: string;
  numeroPaginas?: number;
  altura?: number;
  largura?: number;
  peso?: number;
  profundidade?: number;
  codigoBarras?: string;
  quantidadeEstoque?: number;
  precoVenda?: number;
  valorCusto?: number;
}

export interface IResultadoAtualizacaoLivro {
  sucesso: boolean;
  livro?: ILivroAdminDetalhe;
  aprovacaoNecessaria?: boolean;
  solicitacaoUuid?: string;
  mensagem?: string;
}
