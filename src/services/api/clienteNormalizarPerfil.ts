import type { ICliente } from '@/interfaces/cliente';

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
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidade: '',
    estado: '',
    tipo: 'cobranca',
  },
  cartoes: [],
  cartaoPreferencialUuid: null,
};

function enderecosNormalizados(perfil: Partial<ICliente>) {
  const enderecos = perfil.enderecos ?? [];
  return {
    enderecos,
    enderecosEntrega: perfil.enderecosEntrega ?? enderecos,
    enderecoCobranca: perfil.enderecoCobranca ?? enderecos[0] ?? PERFIL_PADRAO.enderecoCobranca,
  };
}

function identidadeBasica(perfil: Partial<ICliente>) {
  return {
    uuid: perfil.uuid ?? '',
    nome: perfil.nome ?? '',
    email: perfil.email ?? '',
    cpf: perfil.cpf ?? '',
    genero: perfil.genero ?? PERFIL_PADRAO.genero,
    dataNascimento: perfil.dataNascimento ?? '',
    telefone: perfil.telefone,
  };
}

function metadadosConta(perfil: Partial<ICliente>) {
  return {
    cartoes: perfil.cartoes ?? [],
    cartaoPreferencialUuid: perfil.cartaoPreferencialUuid ?? null,
    role: perfil.role ?? 'cliente',
    ranking: perfil.ranking ?? 0,
    ativo: perfil.ativo ?? true,
  };
}

export function normalizarPerfilCliente(perfil: Partial<ICliente>): ICliente {
  const end = enderecosNormalizados(perfil);
  return {
    ...PERFIL_PADRAO,
    ...perfil,
    ...identidadeBasica(perfil),
    enderecos: end.enderecos,
    enderecosEntrega: end.enderecosEntrega,
    enderecoCobranca: end.enderecoCobranca,
    ...metadadosConta(perfil),
  };
}
