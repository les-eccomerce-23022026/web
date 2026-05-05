import type { IClienteAdminItem } from '@/services/contracts/adminClienteService';

function nomeEmailCpfContemBusca(c: IClienteAdminItem, filtroBusca: string): boolean {
  if (!filtroBusca) return true;
  const busca = filtroBusca.toLowerCase();
  return (
    c.nome.toLowerCase().includes(busca) ||
    c.email.toLowerCase().includes(busca) ||
    c.cpf.replace(/\D/g, '').includes(filtroBusca.replace(/\D/g, ''))
  );
}

function statusCompativelComFiltro(
  c: IClienteAdminItem,
  filtroAtivo: 'todos' | 'ativo' | 'inativo',
): boolean {
  if (filtroAtivo === 'todos') return true;
  if (filtroAtivo === 'ativo') return c.ativo;
  return !c.ativo;
}

export function clientePassaFiltros(
  c: IClienteAdminItem,
  filtroBusca: string,
  filtroAtivo: 'todos' | 'ativo' | 'inativo',
): boolean {
  return nomeEmailCpfContemBusca(c, filtroBusca) && statusCompativelComFiltro(c, filtroAtivo);
}
