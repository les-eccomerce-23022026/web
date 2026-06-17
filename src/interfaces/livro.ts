export interface ICriarLivroPayload {
  titulo: string;
  isbn: string;
  autorNome: string;
  editoraNome: string;
  categoriaNome?: string;
  grupoPrecificacaoNome: string;
  precoVenda: number;
  quantidadeEstoque: number;
  sinopse?: string;
  valorCusto: number;
  ano: number;
}

export interface ILivro {
  uuid: string;
  titulo: string;
  autor: string;
  preco: number;
  imagem?: string;
  estrelas?: number;
  categorias?: string[];
  categoria?: string; // Usado na lista admin simplificada
  numeroAvaliacoes?: number;
  sinopse?: string;
  status?: 'Ativo' | 'Inativo' | string;
  isbn: string;
  estoque: number;
}
