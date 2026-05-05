import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { EmptyState } from '@/components/Comum/EmptyState/EmptyState';

export const CarrinhoVazio = () => (
  <div className="carrinho-page page-transition-enter" data-cy="carrinho-vazio">
    <h1 className="page-title">Carrinho de Compras</h1>
    <hr className="carrinho-separator" />

    <EmptyState
      title="Seu carrinho está vazio"
      message="Explore nosso catálogo e adicione livros que deseja levar para casa."
      icon={<ShoppingCart size={80} strokeWidth={1} color="var(--bn-primary)" />}
    />

    <div className="carrinho-empty-actions">
      <Link href="/" className="carrinho-empty-link">
        <button type="button" className="carrinho-empty-cta">
          Continuar comprando
        </button>
      </Link>
    </div>
  </div>
);
