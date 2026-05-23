/**
 * Rotas centralizadas da aplicação
 * 
 * Este arquivo contém todas as URLs da aplicação em um único lugar.
 * Isso facilita a manutenção e alteração de rotas sem quebrar referências.
 * 
 * @example
 * import { ROTAS } from '@/config/rotas';
 * <Link href={ROTAS.MINHA_CONTA}>Minha Conta</Link>
 * router.push(ROTAS.CARRINHO);
 */

export const ROTAS = {
  // Rotas públicas
  HOME: '/',
  MAIS_VENDIDOS: '/mais-vendidos',
  
  // Rotas de catálogo
  CATEGORIA: (slug: string) => `/categoria/${slug}`,
  LIVRO: (uuid: string) => `/livro/${uuid}`,
  
  // Rotas de cliente
  MINHA_CONTA: '/minha-conta',
  PEDIDOS: '/pedidos',
  PEDIDO_TROCA: (uuid: string) => `/pedidos/${uuid}/troca`,
  
  // Rotas de venda
  CARRINHO: '/carrinho',
  CHECKOUT: '/checkout',
  PAGAMENTO_PIX: '/pagamento-pix',
  PEDIDO_CONFIRMADO: '/pedido-confirmado',
  
  // Rotas de admin
  ADMIN: {
    HOME: '/admin',
    ADMINISTRADORES: '/admin/administradores',
    LIVROS: '/admin/livros',
    LIVRO_NOVO: '/admin/livros/novo',
    PEDIDOS: '/admin/pedidos',
    TROCAS: '/admin/trocas',
    CLIENTES: '/admin/clientes',
    ESTOQUE: '/admin/estoque',
  },
  
  // Rotas de suporte (futuras)
  CENTRAL_AJUDA: '/central-ajuda',
  POLITICA_TROCAS: '/politica-trocas',
  FALE_CONOSCO: '/fale-conosco',
  TERMOS_USO: '/termos-uso',
  NOTIFICACOES: '/notificacoes',
} as const;

// Type helpers para rotas dinâmicas
export type RotaAdmin = keyof typeof ROTAS.ADMIN;
export type RotaDinamica = typeof ROTAS.CATEGORIA | typeof ROTAS.LIVRO | typeof ROTAS.PEDIDO_TROCA;
