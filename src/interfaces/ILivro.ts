export interface ILivro {
  uuid: string;
  titulo: string;
  autor: string;
  preco: number;
  imagem?: string;
  estrelas?: number;
  categorias?: string[];
  categoria?: string;
  numeroAvaliacoes?: number;
  sinopse?: string;
  status?: string;
}
