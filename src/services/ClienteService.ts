import clientesMock from '@/mocks/clientesMock.json';
import authUsersMock from '@/mocks/authUsersMock.json';
import type {
  ICliente,
  IAtualizarPerfilPayload,
  IAlterarSenhaPayload,
  IRegistroClienteCompletoPayload,
} from '@/interfaces/ICliente';
import type { IEnderecoCliente, ICartaoCliente } from '@/interfaces/IPagamento';
import { API_ENDPOINTS, USE_MOCK } from '@/config/apiConfig';
import { ApiClient } from './apiClient';

const PERFIL_PADRAO: Omit<ICliente, 'uuid' | 'nome' | 'email' | 'cpf' | 'enderecos'> = {
  genero: 'Prefiro não informar',
  dataNascimento: '',
  telefone: undefined,
  ranking: 0,
  ativo: true,
  role: 'cliente',
  enderecosEntrega: [],
  enderecoCobranca: {
    uuid: '',
    apelido: '',
    tipoResidencia: 'Casa',
    tipoLogradouro: 'Rua',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
  },
  cartoes: [],
  cartaoPreferencialUuid: null,
};

const normalizarPerfilCliente = (perfil: Partial<ICliente>): ICliente => {
  const enderecos = perfil.enderecos ?? [];

  return {
    ...PERFIL_PADRAO,
    ...perfil,
    uuid: perfil.uuid ?? '',
    nome: perfil.nome ?? '',
    email: perfil.email ?? '',
    cpf: perfil.cpf ?? '',
    genero: perfil.genero ?? PERFIL_PADRAO.genero,
    dataNascimento: perfil.dataNascimento ?? '',
    telefone: perfil.telefone,
    enderecos,
    enderecosEntrega: perfil.enderecosEntrega ?? enderecos,
    enderecoCobranca: perfil.enderecoCobranca ?? enderecos[0] ?? PERFIL_PADRAO.enderecoCobranca,
    cartoes: perfil.cartoes ?? [],
    cartaoPreferencialUuid: perfil.cartaoPreferencialUuid ?? null,
    role: perfil.role ?? 'cliente',
    ranking: perfil.ranking ?? 0,
    ativo: perfil.ativo ?? true,
  };
};

export class ClienteService {
  /**
   * RF0021 - Obter perfil completo do cliente logado
   */
  static async obterPerfil(userUuid: string): Promise<ICliente> {
    if (USE_MOCK) {
      console.log('[Mock] Buscando perfil do cliente:', userUuid);

      const cliente = clientesMock.clientes.find((c) => c.uuid === userUuid);
      if (!cliente) {
        return Promise.reject(new Error('Cliente não encontrado.'));
      }

      return new Promise((resolve) =>
        setTimeout(() => resolve(cliente as unknown as ICliente), 300),
      );
    }

    const perfil = await ApiClient.get<Partial<ICliente>>(API_ENDPOINTS.obterPerfilCliente);
    return normalizarPerfilCliente(perfil);
  }

  /**
   * RF0022 - Atualizar dados cadastrais do cliente
   */
  static async atualizarPerfil(payload: IAtualizarPerfilPayload): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Atualizando perfil:', payload);
      return new Promise((resolve) => setTimeout(resolve, 300));
    }

    await ApiClient.patch(API_ENDPOINTS.atualizarPerfilCliente, payload);
  }

  /**
   * RF0028 - Alteração apenas de senha
   */
  static async alterarSenha(
    userUuid: string,
    payload: IAlterarSenhaPayload,
  ): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Alterando senha do cliente:', userUuid);

      const usuario = authUsersMock.usuarios.find((u) => u.uuid === userUuid);
      if (!usuario) {
        return Promise.reject(new Error('Usuário não encontrado.'));
      }
      if (usuario.senha !== payload.senhaAtual) {
        return Promise.reject(new Error('Senha atual incorreta.'));
      }

      return new Promise((resolve) => setTimeout(resolve, 300));
    }

    await ApiClient.patch(API_ENDPOINTS.alterarSenhaCliente, {
      senhaAtual: payload.senhaAtual,
      novaSenha: payload.novaSenha,
      confirmacaoNovaSenha: payload.confirmacaoNovaSenha,
    });
  }

  /**
   * RF0023 - Inativar cadastro de cliente
   */
  static async inativarConta(): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Inativando conta do cliente.');
      return new Promise((resolve) => setTimeout(resolve, 300));
    }

    await ApiClient.delete(API_ENDPOINTS.inativarContaCliente);
  }

  /**
   * RF0026 - Listar endereços de entrega do cliente
   */
  static async listarEnderecos(userUuid: string): Promise<IEnderecoCliente[]> {
    if (USE_MOCK) {
      const cliente = clientesMock.clientes.find((c) => c.uuid === userUuid);
      if (!cliente) return Promise.resolve([]);

      return new Promise((resolve) =>
        setTimeout(
          () => resolve(cliente.enderecosEntrega as IEnderecoCliente[]),
          200,
        ),
      );
    }

    return ApiClient.get<IEnderecoCliente[]>(API_ENDPOINTS.listarEnderecos);
  }

  /**
   * RF0026 - Adicionar endereço de entrega
   */
  static async adicionarEndereco(
    endereco: Omit<IEnderecoCliente, 'uuid'>,
  ): Promise<IEnderecoCliente> {
    if (USE_MOCK) {
      console.log('[Mock] Adicionando endereço:', endereco);
      const novoEndereco: IEnderecoCliente = {
        ...endereco,
        uuid: `end-${Date.now()}`,
      };
      return new Promise((resolve) => setTimeout(() => resolve(novoEndereco), 300));
    }

    return ApiClient.post<IEnderecoCliente>(API_ENDPOINTS.adicionarEndereco, endereco);
  }

  /**
   * RNF0034 - Editar endereço (sem alterar demais dados)
   */
  static async editarEndereco(
    uuid: string,
    endereco: Partial<IEnderecoCliente>,
  ): Promise<IEnderecoCliente> {
    if (USE_MOCK) {
      console.log('[Mock] Editando endereço:', uuid, endereco);
      return new Promise((resolve) =>
        setTimeout(() => resolve({ ...endereco, uuid } as IEnderecoCliente), 300),
      );
    }

    return ApiClient.put<IEnderecoCliente>(API_ENDPOINTS.editarEndereco(uuid), endereco);
  }

  /**
   * Remover endereço de entrega
   */
  static async removerEndereco(uuid: string): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Removendo endereço:', uuid);
      return new Promise((resolve) => setTimeout(resolve, 300));
    }

    await ApiClient.delete(API_ENDPOINTS.removerEndereco(uuid));
  }

  /**
   * RF0027 - Listar cartões do cliente
   */
  static async listarCartoes(userUuid: string): Promise<ICartaoCliente[]> {
    if (USE_MOCK) {
      const cliente = clientesMock.clientes.find((c) => c.uuid === userUuid);
      if (!cliente) return Promise.resolve([]);

      return new Promise((resolve) =>
        setTimeout(
          () => resolve(cliente.cartoes as ICartaoCliente[]),
          200,
        ),
      );
    }

    return ApiClient.get<ICartaoCliente[]>(API_ENDPOINTS.listarCartoes);
  }

  /**
   * RF0027 - Adicionar cartão de crédito
   */
  static async adicionarCartao(
    cartao: Omit<ICartaoCliente, 'uuid'>,
  ): Promise<ICartaoCliente> {
    if (USE_MOCK) {
      console.log('[Mock] Adicionando cartão:', cartao);
      const novoCartao: ICartaoCliente = {
        ...cartao,
        uuid: `card-${Date.now()}`,
      };
      return new Promise((resolve) => setTimeout(() => resolve(novoCartao), 300));
    }

    let idBandeira = 1;
    if (cartao.bandeira.toLowerCase() === 'mastercard') idBandeira = 2;
    else if (cartao.bandeira.toLowerCase() === 'elo') idBandeira = 3;
    
    let validadeIso = cartao.validade;
    if (cartao.validade.includes('/')) {
      const [mes, ano] = cartao.validade.split('/');
      validadeIso = `20${ano}-${mes}-01T00:00:00.000Z`;
    }

    const payloadApi = {
      idBandeiraCartao: idBandeira,
      tokenCartao: `tok_sim_${Date.now()}`,
      finalCartao: cartao.final,
      nomeImpresso: cartao.nomeImpresso,
      validade: validadeIso,
      principal: false,
    };

    return ApiClient.post<ICartaoCliente>(API_ENDPOINTS.adicionarCartao, payloadApi);
  }

  /**
   * Remover cartão de crédito
   */
  static async removerCartao(uuid: string): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Removendo cartão:', uuid);
      return new Promise((resolve) => setTimeout(resolve, 300));
    }

    await ApiClient.delete(API_ENDPOINTS.removerCartao(uuid));
  }

  /**
   * RF0027 - Definir cartão como preferencial
   */
  static async definirCartaoPreferencial(cartaoUuid: string): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Definindo cartão preferencial:', cartaoUuid);
      return new Promise((resolve) => setTimeout(resolve, 300));
    }

    await ApiClient.patch(API_ENDPOINTS.definirCartaoPreferencial(cartaoUuid));
  }

  /**
   * RF0021 - Registrar cliente completo (com endereço e todos os campos)
   */
  static async registrarClienteCompleto(
    payload: IRegistroClienteCompletoPayload,
  ): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Registrando cliente completo:', payload.email);

      const jaExiste = authUsersMock.usuarios.some(
        (u) => u.email === payload.email || u.cpf === payload.cpf,
      );
      if (jaExiste) {
        return Promise.reject(new Error('E-mail ou CPF já cadastrado.'));
      }

      return new Promise((resolve) => setTimeout(resolve, 500));
    }

    await ApiClient.post(API_ENDPOINTS.registrarCliente, payload);
  }
}
