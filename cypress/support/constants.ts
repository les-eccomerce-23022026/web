/**
 * Constantes globais para testes E2E
 * Padroniza timeouts e configurações em toda a suíte de testes
 */

export const TIMEOUT = {
  /** Timeout para chamadas de rede (APIs) */
  REDE: 20000,
  
  /** Timeout para renderização de DOM */
  RENDER: 10000,
  
  /** Timeout para operações de IA (processamento mais lento) */
  IA: 120000,
  
  /** Timeout para assertions visuais */
  VISUAL: 5000,
  
  /** Timeout para operações de banco de dados */
  BANCO: 30000,
  
  /** Timeout para navegação entre páginas */
  NAVEGACAO: 15000,
  
  /** Timeout para carregamento de imagens */
  IMAGEM: 25000,
} as const;

export const SELECTORS = {
  /** Prefixo para atributos data-cy */
  DATA_CY_PREFIX: 'data-cy',
  
  /** Classes comuns para Page Objects */
  BUTTON: 'button',
  INPUT: 'input',
  SELECT: 'select',
  TABLE: 'table',
  MODAL: 'modal',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
} as const;

export const MENSAGENS = {
  /** Mensagens de sucesso padrão */
  SUCESSO: {
    CADASTRO: 'Cadastro realizado com sucesso',
    ATUALIZACAO: 'Dados atualizados com sucesso',
    EXCLUSAO: 'Item excluído com sucesso',
    VENDA: 'Venda realizada com sucesso',
    PAGAMENTO: 'Pagamento aprovado',
  },
  
  /** Mensagens de erro padrão */
  ERRO: {
    CAMPO_OBRIGATORIO: 'Campo obrigatório',
    EMAIL_INVALIDO: 'E-mail inválido',
    SENHA_FRACA: 'Senha muito fraca',
    CONEXAO: 'Erro de conexão',
    AUTORIZACAO: 'Não autorizado',
  },
} as const;

export const ENDPOINTS = {
  /** Endpoints da API para aliases */
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  
  VENDAS: {
    CRIAR: '/vendas',
    LISTAR: '/vendas',
    DETALHES: '/vendas/*',
  },
  
  CLIENTES: {
    PERFIL: '/clientes/perfil',
    ENDERECOS: '/clientes/enderecos',
    CARTOES: '/clientes/cartoes',
  },
  
  ADMIN: {
    PEDIDOS: '/admin/pedidos',
    CLIENTES: '/admin/clientes',
    LIVROS: '/admin/livros',
  },
} as const;

export const DADOS_TESTE = {
  /** Dados padrão para testes */
  USUARIO: {
    EMAIL: 'teste@exemplo.com',
    SENHA: 'Senha123!',
    NOME: 'Usuário Teste',
    CPF: '123.456.789-00',
  },
  
  ENDERECO: {
    CEP: '01310-100',
    RUA: 'Avenida Paulista',
    NUMERO: '1000',
    BAIRRO: 'Bela Vista',
    CIDADE: 'São Paulo',
    ESTADO: 'SP',
  },
  
  CARTAO: {
    NUMERO: '4111111111111111',
    NOME: 'USUARIO TESTE',
    VALIDADE: '12/2025',
    CVV: '123',
  },
} as const;