import homeCatalogoMock from '@/mocks/homeCatalogoMock.json';
import detalhesLivroMock from '@/mocks/detalhesLivroMock.json';
import listaLivrosAdminMock from '@/mocks/listaLivrosAdminMock.json';

export class LivroService {
  static async getDestaques(): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve(homeCatalogoMock.destaques), 300));
  }

  static async getDetalhes(_id: string): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve(detalhesLivroMock), 300));
  }
  
  static async getListaAdmin(): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve(listaLivrosAdminMock.livros), 300));
  }
}
