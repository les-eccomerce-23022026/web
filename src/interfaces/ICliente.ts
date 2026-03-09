import type { IEnderecoCliente, ICartaoCliente } from './IPagamento';

export interface ITelefone {
  tipo: 'Celular' | 'Residencial' | 'Comercial';
  ddd: string;
  numero: string;
}

export type Genero = 'Masculino' | 'Feminino' | 'Outro' | 'Prefiro não informar';

export interface ICliente {
  uuid: string;
  nome: string;
  email: string;
  cpf: string;
  genero: Genero;
  dataNascimento: string;
  telefone?: ITelefone; // Agora opcional
  ranking: number;
  ativo: boolean;
  role: 'cliente' | 'admin';
  enderecosEntrega: IEnderecoCliente[];
  enderecoCobranca: IEnderecoCliente;
  enderecos: IEnderecoCliente[]; // Adicionado para compatibilidade com backend
  cartoes: ICartaoCliente[];
  cartaoPreferencialUuid: string | null;
}

export interface IRegistroClienteCompletoPayload {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  confirmacaoSenha: string;
  genero: Genero;
  dataNascimento: string;
  telefone: ITelefone;
  enderecoCobranca: Omit<IEnderecoCliente, 'uuid'>;
  enderecoEntrega: Omit<IEnderecoCliente, 'uuid'>;
  enderecoEntregaIgualCobranca: boolean;
}

export interface IAtualizarPerfilPayload {
  nome: string;
  genero: Genero;
  dataNascimento: string;
  telefone: ITelefone;
}

export interface IAlterarSenhaPayload {
  senhaAtual: string;
  novaSenha: string;
  confirmacaoNovaSenha: string;
}
