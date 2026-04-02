import type { IFiltrosListaClientes } from '@/services/contracts/adminClienteService';
import type { IClienteAdminItem } from '@/services/contracts/adminClienteService';

export function aplicarFiltrosListaClientes(
  lista: IClienteAdminItem[],
  filtros: IFiltrosListaClientes,
): IClienteAdminItem[] {
  let out = lista;
  if (filtros.nome) {
    out = out.filter((c) => c.nome.toLowerCase().includes(filtros.nome!.toLowerCase()));
  }
  if (filtros.email) {
    out = out.filter((c) => c.email.toLowerCase().includes(filtros.email!.toLowerCase()));
  }
  if (filtros.cpf) {
    const cpfLimpo = filtros.cpf.replace(/\D/g, '');
    out = out.filter((c) => c.cpf.replace(/\D/g, '').includes(cpfLimpo));
  }
  return out;
}
