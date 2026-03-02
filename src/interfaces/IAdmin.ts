export interface IAdmin {
  uuid: string;
  nome: string;
  email: string;
  role: string;
}

export interface IAdminFormState {
  nome: string;
  email: string;
  senha: string;
}
