import type { ILivro } from '@/interfaces/ILivro';

export function livroPassaBusca(livro: ILivro, term: string): boolean {
  if (!term) return true;
  const t = term.toLowerCase();
  return (
    livro.titulo.toLowerCase().includes(t) ||
    livro.autor.toLowerCase().includes(t) ||
    livro.isbn.toLowerCase().includes(t) ||
    Boolean(livro.sinopse?.toLowerCase().includes(t))
  );
}

export function livroPassaStatus(
  livro: ILivro,
  statusFilter: 'todos' | 'ativos' | 'inativos',
): boolean {
  if (statusFilter === 'todos') return true;
  if (statusFilter === 'ativos') return livro.status === 'Ativo';
  return livro.status === 'Inativo';
}

export function livroPassaFiltrosLista(
  livro: ILivro,
  searchTerm: string,
  statusFilter: 'todos' | 'ativos' | 'inativos',
): boolean {
  return livroPassaBusca(livro, searchTerm) && livroPassaStatus(livro, statusFilter);
}
