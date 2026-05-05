interface CatalogoHeaderProps {
  termoBusca: string;
}

export const CatalogoHeader = ({ termoBusca }: CatalogoHeaderProps) => (
  <>
    {!termoBusca && (
      <div className="pagina-inicio__banner">
        <h2 className="pagina-inicio__banner-titulo">Ofertas de Inverno - Até 50% em Ficção</h2>
      </div>
    )}
    <div className="catalogo-header">
      {termoBusca ? (
        <div className="search-results-info">
          <h3>
            Resultados para: <span>&quot;{termoBusca}&quot;</span>
          </h3>
        </div>
      ) : (
        <h3>Lançamentos em destaque</h3>
      )}
    </div>
  </>
);
