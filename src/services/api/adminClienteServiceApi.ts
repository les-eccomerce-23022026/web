import { ApiClient } from '../apiClient';
import { API_ENDPOINTS } from '@/config/apiConfig';
import type {
  IAdminClienteService,
  IFiltrosListaClientes,
  IResultadoListaClientes,
  IDetalheClienteAdmin,
} from '../contracts/adminClienteService';

export class AdminClienteServiceApi implements IAdminClienteService {
  async listarClientes(filtros?: IFiltrosListaClientes): Promise<IResultadoListaClientes> {
    const params = new URLSearchParams();

    if (filtros) {
      if (filtros.nome) params.append("nome", filtros.nome);
      if (filtros.cpf) params.append("cpf", filtros.cpf);
      if (filtros.email) params.append("email", filtros.email);
      if (filtros.ativo !== undefined) params.append("ativo", String(filtros.ativo));
      if (filtros.pagina) params.append("pagina", filtros.pagina.toString());
      if (filtros.limite) params.append("limite", filtros.limite.toString());
    }

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.listarClientes}?${queryString}`
      : API_ENDPOINTS.listarClientes;

    return ApiClient.get<IResultadoListaClientes>(url);
  }

  async obterClientePorUuid(uuid: string): Promise<IDetalheClienteAdmin> {
    return ApiClient.get<IDetalheClienteAdmin>(API_ENDPOINTS.obterClienteAdmin(uuid));
  }

  async inativarCliente(uuid: string, ativo: boolean): Promise<{ uuid: string; ativo: boolean }> {
    return ApiClient.patch<{ uuid: string; ativo: boolean }>(
      API_ENDPOINTS.inativarClienteAdmin(uuid),
      { ativo },
    );
  }
}
