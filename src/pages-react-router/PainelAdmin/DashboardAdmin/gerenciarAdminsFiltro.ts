import type { IAdmin } from '../../../interfaces/admin';

function nomeEmailContemBusca(admin: IAdmin, filtroBusca: string): boolean {
  if (!filtroBusca) return true;
  const busca = filtroBusca.toLowerCase();
  return (
    admin.nome.toLowerCase().includes(busca) ||
    admin.email.toLowerCase().includes(busca)
  );
}

function statusCompativelComFiltro(
  admin: IAdmin,
  filtroStatus: 'todos' | 'ativo' | 'inativo',
): boolean {
  if (filtroStatus === 'todos') return true;
  if (filtroStatus === 'ativo') return admin.ativo === true;
  return admin.ativo === false || admin.ativo === undefined;
}

export function adminPassaFiltros(
  admin: IAdmin,
  filtroBusca: string,
  filtroStatus: 'todos' | 'ativo' | 'inativo',
): boolean {
  return nomeEmailContemBusca(admin, filtroBusca) && statusCompativelComFiltro(admin, filtroStatus);
}
