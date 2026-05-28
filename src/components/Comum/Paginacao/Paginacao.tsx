import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  totalItens?: number;
  labelItens?: string;
  onPaginaAnterior: () => void;
  onProximaPagina: () => void;
  onIrParaPagina?: (pagina: number) => void;
}

export const Paginacao = ({
  paginaAtual,
  totalPaginas,
  totalItens,
  labelItens = 'itens',
  onPaginaAnterior,
  onProximaPagina,
  onIrParaPagina,
}: PaginacaoProps) => {
  if (totalPaginas <= 1) {
    return null;
  }

  return (
    <div className="paginacao-container" role="navigation" aria-label="Paginação">
      <button
        type="button"
        className="paginacao-botao"
        disabled={paginaAtual <= 1}
        onClick={onPaginaAnterior}
        aria-label="Página anterior"
      >
        <ChevronLeft size={20} /> Anterior
      </button>
      
      <span className="paginacao-info">
        Página {paginaAtual} de {totalPaginas}
        {totalItens !== undefined && ` (${totalItens} ${labelItens})`}
      </span>
      
      <button
        type="button"
        className="paginacao-botao"
        disabled={paginaAtual >= totalPaginas}
        onClick={onProximaPagina}
        aria-label="Próxima página"
      >
        Próxima <ChevronRight size={20} />
      </button>
    </div>
  );
};
