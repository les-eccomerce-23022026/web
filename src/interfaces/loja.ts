export interface ILoja {
  uuid: string;
  nome: string;
  slug: string;
  cnpj: string;
  ativo: boolean;
}

export interface ILojaFormState {
  nome: string;
  slug: string;
  cnpj: string;
}
