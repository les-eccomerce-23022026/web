import { useAutenticacaoCliente } from './useAutenticacaoCliente';

export type AutenticacaoClienteLoginState = ReturnType<typeof useAutenticacaoCliente>['loginState'];
export type AutenticacaoClienteCadastroState = ReturnType<typeof useAutenticacaoCliente>['registerState'];
export type AutenticacaoClienteDominios = ReturnType<typeof useAutenticacaoCliente>['dominios'];
