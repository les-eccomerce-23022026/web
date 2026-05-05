import { fetchCatalogoLivros } from 'lib/data/fetchLivro';
import type { LivroMetadata } from 'lib/data/fetchLivro';

export const MaisVendidos = async () => {
  const catalogo = await fetchCatalogoLivros({
    pagina: 1,
    itensPorPagina: 10,
    ordenacao: 'mais-vendidos',
  });

  if (!catalogo) {
    return (
      <div className="container">
        <h1>Mais Vendidos - Barnes & Noble</h1>
        <p>Erro ao carregar lista de mais vendidos.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Mais Vendidos - Barnes & Noble</h1>
      <p>Os livros mais populares da nossa livraria</p>
      <ul>
        {catalogo.livros.map((livro: LivroMetadata) => (
          <li key={livro.uuid}>
            <a href={`/livro/${livro.uuid}`}>{livro.titulo}</a>
            <span> - R$ {livro.preco.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <p>Total: {catalogo.total} livros</p>
    </div>
  );
};
