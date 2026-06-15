import type { ICatalogoLivrosResposta, ICategoriaMenu, IFiltroCatalogoLivros } from '@/interfaces/catalogoLivros';
import type { ILivro, ICriarLivroPayload } from '@/interfaces/livro';
import type { ILivroAdminDetalhe, IPayloadAtualizacaoLivro } from '@/interfaces/livroAdmin';

export interface ILivroService {
  getCatalogo(filtro?: IFiltroCatalogoLivros): Promise<ICatalogoLivrosResposta>;
  getCategoriasMenu(): Promise<ICategoriaMenu[]>;
  getDetalhes(uuid: string): Promise<ILivro>;
  getListaAdmin(): Promise<ILivro[]>;
  darBaixaEstoque(itens: { livroUuid: string; quantidade: number }[]): Promise<void>;
  criarLivro(payload: ICriarLivroPayload): Promise<ILivro>;
  obterLivroAdmin(uuid: string): Promise<ILivroAdminDetalhe>;
  atualizarLivro(uuid: string, dados: IPayloadAtualizacaoLivro): Promise<{ sucesso: boolean; aprovacaoNecessaria?: boolean; mensagem?: string }>;
}
