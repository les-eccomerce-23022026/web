import homeCatalogoMock from '@/mocks/homeCatalogoMock.json';
import detalhesLivroMock from '@/mocks/detalhesLivroMock.json';
import listaLivrosAdminMock from '@/mocks/listaLivrosAdminMock.json';
import type { Livro } from '@/interfaces/Livro';

export class LivroService {
  static async getDestaques(): Promise<Livro[]> {
    return new Promise((resolve) => setTimeout(() => resolve(homeCatalogoMock.destaques as Livro[]), 300));
  }

  static async getDetalhes(_id: string): Promise<Livro> {
    return new Promise((resolve) => setTimeout(() => resolve(detalhesLivroMock as Livro), 300));
  }
  
  static async getListaAdmin(): Promise<Livro[]> {
    return new Promise((resolve) => setTimeout(() => resolve(listaLivrosAdminMock.livros as Livro[]), 300));
  }
}
