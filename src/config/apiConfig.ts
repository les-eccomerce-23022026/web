export const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

if (!BASE_URL) {
  throw new Error("A variável de ambiente VITE_API_BASE_URL não está definida. Verifique o seu arquivo .env");
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
  solicitarTroca: (pedidoUuid: string) => `${BASE_URL}/pedidos/${pedidoUuid}/troca`,

  // Trocas (Admin)
  obterPedidosEmTroca: `${BASE_URL}/admin/trocas`,
  autorizarTroca: (pedidoUuid: string) => `${BASE_URL}/admin/trocas/${pedidoUuid}/autorizar`,
  confirmarRecebimentoTroca: (pedidoUuid: string) => `${BASE_URL}/admin/trocas/${pedidoUuid}/confirmar`,

  // Cupons de troca
  obterCuponsCliente: `${BASE_URL}/cupons/troca`,

  // Pagamento
  obterPagamentoInfo: `${BASE_URL}/pagamento/info`,
  processarPagamento: `${BASE_URL}/pagamento/processar`,

  // Autenticação
  login: `${BASE_URL}/auth/login`,
  registrarCliente: `${BASE_URL}/clientes/registro`,
  registrarAdmin: `${BASE_URL}/admin/registro`,

  // Perfil do Cliente
  obterPerfilCliente: `${BASE_URL}/clientes/perfil`,
  atualizarPerfilCliente: `${BASE_URL}/clientes/perfil`,
  alterarSenhaCliente: `${BASE_URL}/clientes/senha`,
  inativarContaCliente: `${BASE_URL}/clientes/inativar`,

  // Endereços do Cliente
  listarEnderecos: `${BASE_URL}/clientes/enderecos`,
  adicionarEndereco: `${BASE_URL}/clientes/enderecos`,
  editarEndereco: (uuid: string) => `${BASE_URL}/clientes/enderecos/${uuid}`,
  removerEndereco: (uuid: string) => `${BASE_URL}/clientes/enderecos/${uuid}`,

  // Cartões do Cliente
  listarCartoes: `${BASE_URL}/clientes/cartoes`,
  adicionarCartao: `${BASE_URL}/clientes/cartoes`,
  editarCartao: (uuid: string) => `${BASE_URL}/clientes/cartoes/${uuid}`,
  removerCartao: (uuid: string) => `${BASE_URL}/clientes/cartoes/${uuid}`,
  definirCartaoPreferencial: (uuid: string) => `${BASE_URL}/clientes/cartoes/${uuid}/preferencial`,

  // Clientes (Admin)
  listarClientes: `${BASE_URL}/admin/clientes`,
  obterClienteAdmin: (uuid: string) => `${BASE_URL}/admin/clientes/${uuid}`,

  // Pedidos (Admin)
  obterTodosPedidosAdmin: `${BASE_URL}/admin/pedidos`,
  despacharPedido: (uuid: string) => `${BASE_URL}/admin/pedidos/${uuid}/despachar`,
  confirmarEntrega: (uuid: string) => `${BASE_URL}/admin/pedidos/${uuid}/entrega`,
};

export const MOCK_TOKEN_PREFIX = 'mock-token';
