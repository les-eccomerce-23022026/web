import clientesMock from '@/mocks/clientesMock.json';
import type { 
  IAdminClienteService, 
  IFiltrosListaClientes, 
  IResultadoListaClientes,
  IClienteAdminItem 
} from '@/services/contracts/IAdminClienteService';

export class AdminClienteServiceMock implements IAdminClienteService {
  async listarClientes(filtros?: IFiltrosListaClientes): Promise<IResultadoListaClientes> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let clientesFiltrados = (clientesMock.clientes as unknown as IClienteAdminItem[]).map(c => ({
      uuid: c.uuid,
      nome: c.nome,
      email: c.email,
      cpf: c.cpf,
      ativo: c.ativo,
      criadoEm: new Date().toISOString() // Mock não tem data de criação real
    })) as IClienteAdminItem[];

    if (filtros) {
      if (filtros.nome) {
        clientesFiltrados = clientesFiltrados.filter(c => 
          c.nome.toLowerCase().includes(filtros.nome!.toLowerCase())
        );
      }
      if (filtros.email) {
        clientesFiltrados = clientesFiltrados.filter(c => 
          c.email.toLowerCase().includes(filtros.email!.toLowerCase())
        );
      }
      if (filtros.cpf) {
        const cpfLimpo = filtros.cpf.replace(/\D/g, '');
        clientesFiltrados = clientesFiltrados.filter(c => 
          c.cpf.replace(/\D/g, '').includes(cpfLimpo)
        );
      }
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
