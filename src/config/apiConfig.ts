export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

if (!USE_MOCK && !BASE_URL) {
  throw new Error(
    "A variável de ambiente VITE_API_BASE_URL não está definida. Verifique o seu arquivo .env",
  );
}

export const API_ENDPOINTS = {
  // Livros
  obterCarrinho: `${BASE_URL}/carrinho`,
  obterLivrosDestaque: `${BASE_URL}/livros/destaques`,
  obterListaLivrosAdmin: `${BASE_URL}/admin/livros`,
  obterCheckoutInfo: `${BASE_URL}/checkout`,
  obterDashboardAdminInfo: `${BASE_URL}/admin/dashboard`,
  obterDetalhesLivro: (uuid: string) => `${BASE_URL}/livros/${uuid}`,

  // Pedidos
  obterPedidosCliente: `${BASE_URL}/pedidos`,
  solicitarTroca: (pedidoUuid: string) =>
    `${BASE_URL}/pedidos/${pedidoUuid}/troca`,

  // Trocas (Admin)
  obterPedidosEmTroca: `${BASE_URL}/admin/trocas`,
  autorizarTroca: (pedidoUuid: string) =>
    `${BASE_URL}/admin/trocas/${pedidoUuid}/autorizar`,
  confirmarRecebimentoTroca: (pedidoUuid: string) =>
    `${BASE_URL}/admin/trocas/${pedidoUuid}/confirmar`,

  // Cupons de troca
  obterCuponsCliente: `${BASE_URL}/cupons/troca`,

  // Vendas (pedido — backend retorna JSON direto, sem envelope { sucesso, dados })
  criarVenda: `${BASE_URL}/vendas`,

  // Pagamento
  obterPagamentoInfo: `${BASE_URL}/pagamento/info`,
  selecionarPagamento: `${BASE_URL}/pagamentos/selecionar`,
  solicitarAutorizacaoFinanceira: (uuid: string) =>
    `${BASE_URL}/pagamentos/${uuid}/processar`,
  solicitarAutorizacaoFinanceiraCheckout: `${BASE_URL}/pagamento/processar`,
  consultarPagamento: (uuid: string) => `${BASE_URL}/pagamentos/${uuid}`,

  // Autenticação
  login: `${BASE_URL}/auth/login`,
  /** Verifica a sessão atual e retorna o usuário autenticado (HttpOnly cookie) */
  me: `${BASE_URL}/auth/me`,
  registrarCliente: `${BASE_URL}/clientes/registro`,
  
  // Administração (Admin)
  registrarAdmin: `${BASE_URL}/admin/registro`,
  listarAdmins: `${BASE_URL}/admin/administradores`,
  ativarAdmin: (uuid: string) => `${BASE_URL}/admin/administradores/${uuid}/ativar`,
  inativarAdmin: (uuid: string) => `${BASE_URL}/admin/administradores/${uuid}/inativar`,

  // Perfil do Cliente
  obterPerfilCliente: `${BASE_URL}/clientes/perfil`,
  atualizarPerfilCliente: `${BASE_URL}/clientes/perfil`,
  alterarSenhaCliente: `${BASE_URL}/clientes/seguranca/alterar-senha`,
  inativarContaCliente: `${BASE_URL}/clientes/perfil`,

  // Endereços do Cliente
  listarEnderecos: `${BASE_URL}/clientes/perfil/enderecos`,
  adicionarEndereco: `${BASE_URL}/clientes/perfil/enderecos`,
  editarEndereco: (uuid: string) =>
    `${BASE_URL}/clientes/perfil/enderecos/${uuid}`,
  removerEndereco: (uuid: string) =>
    `${BASE_URL}/clientes/perfil/enderecos/${uuid}`,

  // Cartões do Cliente
  listarCartoes: `${BASE_URL}/clientes/perfil/cartoes`,
  adicionarCartao: `${BASE_URL}/clientes/perfil/cartoes`,
  editarCartao: (uuid: string) => `${BASE_URL}/clientes/perfil/cartoes/${uuid}`,
  removerCartao: (uuid: string) =>
    `${BASE_URL}/clientes/perfil/cartoes/${uuid}`,
  definirCartaoPreferencial: (uuid: string) =>
    `${BASE_URL}/clientes/perfil/cartoes/${uuid}/principal`,

  // Clientes (Admin)
  listarClientes: `${BASE_URL}/clientes`,
  obterClienteAdmin: (uuid: string) => `${BASE_URL}/clientes/${uuid}`,

  // Pedidos (Admin)
  obterTodosPedidosAdmin: `${BASE_URL}/admin/pedidos`,
  despacharPedido: (uuid: string) =>
    `${BASE_URL}/admin/pedidos/${uuid}/despachar`,
  confirmarEntrega: (uuid: string) =>
    `${BASE_URL}/admin/pedidos/${uuid}/entrega`,
};

export const MOCK_TOKEN_PREFIX = "mock-token";
