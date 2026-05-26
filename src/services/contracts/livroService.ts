import type { ICatalogoLivrosResposta, ICategoriaMenu, IFiltroCatalogoLivros } from '@/interfaces/catalogoLivros';
import type { ILivro } from '@/interfaces/livro';

export interface ILivroService {
  getCatalogo(filtro?: IFiltroCatalogoLivros): Promise<ICatalogoLivrosResposta>;
  getCategoriasMenu(): Promise<ICategoriaMenu[]>;
  getDetalhes(uuid: string): Promise<ILivro>;
  getListaAdmin(): Promise<ILivro[]>;
  darBaixaEstoque(itens: { livroUuid: string; quantidade: number }[]): Promise<void>;
}
