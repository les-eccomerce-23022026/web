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
