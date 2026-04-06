import type { ILivro } from '@/interfaces/livro';

export type OrdenacaoCatalogo = 'recentes' | 'mais-vendidos';

export interface ICatalogoLivrosResposta {
  livros: ILivro[];
  total: number;
  pagina: number;
  itensPorPagina: number;
}

export interface ICategoriaMenu {
  slug: string;
  nome: string;
}

export interface IFiltroCatalogoLivros {
  pagina?: number;
  itensPorPagina?: number;
  categoria?: string;
  ordenacao?: OrdenacaoCatalogo;
}
