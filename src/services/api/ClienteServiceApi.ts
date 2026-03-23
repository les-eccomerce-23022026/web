import type {
  ICliente,
  IAtualizarPerfilPayload,
  IAlterarSenhaPayload,
  IRegistroClienteCompletoPayload,
} from '@/interfaces/ICliente';
import type { IEnderecoCliente, ICartaoCliente } from '@/interfaces/IPagamento';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';
import type { IClienteService } from '@/services/contracts/IClienteService';

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

export class ClienteServiceApi implements IClienteService {
  async obterPerfil(_userUuid: string): Promise<ICliente> {
    const perfil = await ApiClient.get<Partial<ICliente>>(API_ENDPOINTS.obterPerfilCliente);
    return normalizarPerfilCliente(perfil);
  }

  async atualizarPerfil(payload: IAtualizarPerfilPayload): Promise<void> {
    await ApiClient.patch(API_ENDPOINTS.atualizarPerfilCliente, payload);
  }

  async alterarSenha(_userUuid: string, payload: IAlterarSenhaPayload): Promise<void> {
    await ApiClient.patch(API_ENDPOINTS.alterarSenhaCliente, {
      senhaAtual: payload.senhaAtual,
      novaSenha: payload.novaSenha,
      confirmacaoNovaSenha: payload.confirmacaoNovaSenha,
    });
  }

  async inativarConta(): Promise<void> {
    await ApiClient.delete(API_ENDPOINTS.inativarContaCliente);
  }

  async listarEnderecos(_userUuid: string): Promise<IEnderecoCliente[]> {
    return ApiClient.get<IEnderecoCliente[]>(API_ENDPOINTS.listarEnderecos);
  }

  async adicionarEndereco(
    endereco: Omit<IEnderecoCliente, 'uuid'>,
  ): Promise<IEnderecoCliente[]> {
    return ApiClient.post<IEnderecoCliente[]>(API_ENDPOINTS.adicionarEndereco, endereco);
  }

  async editarEndereco(
    uuid: string,
    endereco: Partial<IEnderecoCliente>,
  ): Promise<IEnderecoCliente[]> {
    return ApiClient.patch<IEnderecoCliente[]>(API_ENDPOINTS.editarEndereco(uuid), endereco);
  }

  async removerCartao(uuid: string): Promise<void> {
    await ApiClient.delete(API_ENDPOINTS.removerCartao(uuid));
  }

  async listarCartoes(_userUuid: string): Promise<ICartaoCliente[]> {
    return ApiClient.get<ICartaoCliente[]>(API_ENDPOINTS.listarCartoes);
  }

  async adicionarCartao(cartao: Omit<ICartaoCliente, 'uuid'>): Promise<ICartaoCliente> {
    const bandeirasMap: Record<string, string> = {
      visa: 'd30d587f-8140-469d-a5fc-8e0c998c72f4',
      mastercard: 'd6eac520-7651-4ae9-84d5-b0bbf269be2e',
      elo: '21317eba-311d-4bb8-9054-6debff64f2da',
      'american express': '01fd90d0-0c72-4787-8667-965b2c39f75f',
      hipercard: '02cacd79-1ec5-44c5-9142-486cb4bc82f1',
    };
    const uuidBandeira = bandeirasMap[cartao.bandeira.toLowerCase()] ?? bandeirasMap.visa;

    let validadeIso = cartao.validade;
    if (cartao.validade.includes('/')) {
      const [mes, ano] = cartao.validade.split('/');
      const anoCompleto = ano.length === 2 ? `20${ano}` : ano;
      validadeIso = `${anoCompleto}-${mes.padStart(2, '0')}-01`;
    }

    const payloadApi = {
      uuidBandeira,
      token: `tok_sim_${Date.now()}`,
      final: cartao.final,
      nomeImpresso: cartao.nomeImpresso,
      validade: validadeIso,
      principal: false,
    };

    return ApiClient.post<ICartaoCliente>(API_ENDPOINTS.adicionarCartao, payloadApi);
  }

  async removerCartao(uuid: string): Promise<void> {
    await ApiClient.delete(API_ENDPOINTS.removerCartao(uuid));
  }

  async editarCartao(
    uuid: string,
    cartao: Partial<ICartaoCliente>,
  ): Promise<ICartaoCliente[]> {
    const bandeirasMap: Record<string, string> = {
      visa: 'd30d587f-8140-469d-a5fc-8e0c998c72f4',
      mastercard: 'd6eac520-7651-4ae9-84d5-b0bbf269be2e',
      elo: '21317eba-311d-4bb8-9054-6debff64f2da',
      'american express': '01fd90d0-0c72-4787-8667-965b2c39f75f',
      hipercard: '02cacd79-1ec5-44c5-9142-486cb4bc82f1',
    };
    
    const uuidBandeira = cartao.bandeira 
      ? (bandeirasMap[cartao.bandeira.toLowerCase()] ?? bandeirasMap.visa)
      : undefined;

    let validadeIso = cartao.validade;
    if (cartao.validade && cartao.validade.includes('/')) {
      const [mes, ano] = cartao.validade.split('/');
      const anoCompleto = ano.length === 2 ? `20${ano}` : ano;
      validadeIso = `${anoCompleto}-${mes.padStart(2, '0')}-01`;
    }

    const payloadApi: any = {
      uuidBandeira,
      nomeImpresso: cartao.nomeImpresso,
      validade: validadeIso,
    };

    // Remove undefined fields
    Object.keys(payloadApi).forEach((key) => {
      if (payloadApi[key] === undefined) {
        delete payloadApi[key];
      }
    });

    const result = await ApiClient.patch<any>(
      API_ENDPOINTS.editarCartao(uuid),
      payloadApi,
    );

    // O backend retorna um objeto singular do cartão atualizado, mas o contrato espera uma lista.
    return Array.isArray(result) ? result : [result];
  }

  async definirCartaoPreferencial(cartaoUuid: string): Promise<void> {
    await ApiClient.patch(API_ENDPOINTS.definirCartaoPreferencial(cartaoUuid));
  }

  async registrarClienteCompleto(payload: IRegistroClienteCompletoPayload): Promise<void> {
    await ApiClient.post(API_ENDPOINTS.registrarCliente, payload);
  }
}
