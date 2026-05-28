export interface IAdmin {
  uuid: string;
  nome: string;
  email: string;
  role: string;
  ativo?: boolean;
  trocasPendentes?: number; // Contagem de trocas/devoluções pendentes para admin sistema
}

export interface IAdminFormState {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  confirmacaoSenha: string;
  usarMesmaSenha: boolean;
}
