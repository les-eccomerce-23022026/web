export interface IUsuario {
  uuid: string;
  nome: string;
  email: string;
  cpf?: string;
  cpfMascarado?: string;
  role: "cliente" | "admin";
  eAdminMestre?: boolean;
}

export interface ILoginResponse {
  token?: string;
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
  confirmacaoSenha: string;
}

export interface IRegistroAdminPayload {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  confirmacaoSenha: string;
  usarMesmaSenha?: boolean;
}
