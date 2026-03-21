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

  async removerEndereco(uuid: string): Promise<void> {
    await ApiClient.delete(API_ENDPOINTS.removerEndereco(uuid));
  }

  async listarCartoes(_userUuid: string): Promise<ICartaoCliente[]> {
    return ApiClient.get<ICartaoCliente[]>(API_ENDPOINTS.listarCartoes);
  }

  async adicionarCartao(cartao: Omit<ICartaoCliente, 'uuid'>): Promise<ICartaoCliente> {
    const bandeirasMap: Record<string, number> = {
      mastercard: 2,
      elo: 3,
    };
    const idBandeira = bandeirasMap[cartao.bandeira.toLowerCase()] ?? 1;

    let validadeIso = cartao.validade;
    if (cartao.validade.includes('/')) {
      const [mes, ano] = cartao.validade.split('/');
      // Se o ano vier com 4 dígitos (ex: 2030), usa direto. Se vier com 2 (ex: 30), prefixa com 20.
      const anoCompleto = ano.length === 2 ? `20${ano}` : ano;
      validadeIso = `${anoCompleto}-${mes.padStart(2, '0')}-01`;
    }

    const payloadApi = {
      idBandeira,
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
    const bandeirasMap: Record<string, number> = {
      mastercard: 2,
      elo: 3,
    };
    
    const idBandeira = cartao.bandeira 
      ? (bandeirasMap[cartao.bandeira.toLowerCase()] ?? 1)
      : undefined;

    let validadeIso = cartao.validade;
    if (cartao.validade && cartao.validade.includes('/')) {
      const [mes, ano] = cartao.validade.split('/');
      const anoCompleto = ano.length === 2 ? `20${ano}` : ano;
      validadeIso = `${anoCompleto}-${mes.padStart(2, '0')}-01`;
    }

    const payloadApi: any = {
      idBandeiraCartao: idBandeira,
      nomeImpresso: cartao.nomeImpresso,
      validade: validadeIso,
    };

    // Remove undefined fields
    Object.keys(payloadApi).forEach(key => payloadApi[key] === undefined && delete payloadApi[key]);

    // Assuming endpoint returns list of cards like editarEndereco
    // In some cases it returns a singular object, we'll handle this in the hook.
    return ApiClient.patch<any>(
      API_ENDPOINTS.editarCartao(uuid),
      payloadApi,
    );
  }

  async definirCartaoPreferencial(cartaoUuid: string): Promise<void> {
    await ApiClient.patch(API_ENDPOINTS.definirCartaoPreferencial(cartaoUuid));
  }

  async registrarClienteCompleto(payload: IRegistroClienteCompletoPayload): Promise<void> {
    await ApiClient.post(API_ENDPOINTS.registrarCliente, payload);
  }
}
