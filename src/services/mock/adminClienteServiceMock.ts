import clientesMock from '@/mocks/clientesMock.json';
import type {
  IAdminClienteService,
  IFiltrosListaClientes,
  IResultadoListaClientes,
  IClienteAdminItem,
} from '@/services/contracts/adminClienteService';
import { aplicarFiltrosListaClientes } from '@/services/mock/adminClienteMockFiltros';

export class AdminClienteServiceMock implements IAdminClienteService {
  async listarClientes(filtros?: IFiltrosListaClientes): Promise<IResultadoListaClientes> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let clientesFiltrados = (clientesMock.clientes as unknown as IClienteAdminItem[]).map((c) => ({
      uuid: c.uuid,
      nome: c.nome,
      email: c.email,
      cpf: c.cpf,
      ativo: c.ativo,
      criadoEm: new Date().toISOString(),
    })) as IClienteAdminItem[];

    if (filtros) {
      clientesFiltrados = aplicarFiltrosListaClientes(clientesFiltrados, filtros);
    }

    const total = clientesFiltrados.length;
    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 10;
    const totalPaginas = Math.ceil(total / limite);

    // Paginação simples no mock
    const inicio = (pagina - 1) * limite;
    const fim = inicio + limite;
    const clientesPaginados = clientesFiltrados.slice(inicio, fim);

    return {
      clientes: clientesPaginados,
      total,
      pagina,
      limite,
      totalPaginas
    };
  }
}
