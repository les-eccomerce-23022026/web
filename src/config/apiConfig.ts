export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("A variável de ambiente VITE_API_BASE_URL não está definida. Verifique o seu arquivo .env");
}

export const API_ENDPOINTS = {
  obterCarrinho: `${BASE_URL}/carrinho`,
  obterLivrosDestaque: `${BASE_URL}/livros/destaques`,
  obterListaLivrosAdmin: `${BASE_URL}/admin/livros`,
  obterCheckoutInfo: `${BASE_URL}/checkout`,
  obterDashboardAdminInfo: `${BASE_URL}/admin/dashboard`,
  obterDetalhesLivro: (uuid: string) => `${BASE_URL}/livros/${uuid}`,
};
