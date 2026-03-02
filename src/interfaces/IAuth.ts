export interface IUsuario {
  uuid: string;
  nome: string;
  email: string;
  cpf: string;
  role: "cliente" | "admin";
}

export interface ILoginResponse {
  token: string;
  user: IUsuario;
}

export interface ILoginPayload {
  email: string;
  senha: string;
}

export interface IRegistroClientePayload {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  confirmacao_senha: string;
}

export interface IRegistroAdminPayload {
  nome: string;
  email: string;
  senha: string;
}
