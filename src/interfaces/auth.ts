export interface LojaUsuario {
  loj_id: number;
  loj_uuid: string;
}

export interface IUsuario {
  uuid: string;
  nome: string;
  email: string;
  cpf?: string;
  cpfMascarado?: string;
  role: "cliente" | "admin" | "admin_sistema";
  papeis: string[];
  lojas: LojaUsuario[];
  loja_uuid_principal: string | null;
}

export interface ILoginResponse {
  token?: string;
  refreshTokenExpiresAt?: string;
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
