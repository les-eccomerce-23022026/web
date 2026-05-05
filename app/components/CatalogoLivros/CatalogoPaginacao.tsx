import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CatalogoPaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  totalItens: number;
  onPaginaAnterior: () => void;
  onProximaPagina: () => void;
}

export const CatalogoPaginacao = ({
  paginaAtual,
  totalPaginas,
  totalItens,
  onPaginaAnterior,
  onProximaPagina,
}: CatalogoPaginacaoProps) => (
  <div className="catalogo-paginacao" role="navigation" aria-label="Paginação do catálogo">
    <button
      type="button"
      className="catalogo-paginacao__btn"
      disabled={paginaAtual <= 1}
      onClick={onPaginaAnterior}
      aria-label="Página anterior"
    >
      <ChevronLeft size={20} /> Anterior
    </button>
    <span className="catalogo-paginacao__info">
      Página {paginaAtual} de {totalPaginas} ({totalItens} livros)
    </span>
    <button
      type="button"
      className="catalogo-paginacao__btn"
      disabled={paginaAtual >= totalPaginas}
      onClick={onProximaPagina}
      aria-label="Próxima página"
    >
      Próxima <ChevronRight size={20} />
    </button>
  </div>
);
