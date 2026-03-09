export interface IAdmin {
  uuid: string;
  nome: string;
  email: string;
  role: string;
  ativo?: boolean;
}

export interface IAdminFormState {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  confirmacaoSenha: string;
}
