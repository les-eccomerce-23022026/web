import { ITENS_POR_PAGINA } from '@/config/constantesNegocio';

export function calcularPaginacao<T>(dadosFiltrados: T[], paginaAtual: number) {
  const totalPaginas = Math.ceil(dadosFiltrados.length / ITENS_POR_PAGINA);
  const indiceInicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const indiceFim = indiceInicio + ITENS_POR_PAGINA;
  const dadosPaginados = dadosFiltrados.slice(indiceInicio, indiceFim);

  return { totalPaginas, dadosPaginados };
}
