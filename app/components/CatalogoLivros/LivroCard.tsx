'use client';

import Link from 'next/link';
import { ShoppingCart, AlertCircle } from 'lucide-react';
import { CapaLivro } from '@/components/Comum/CapaLivro/CapaLivro';
import { ControlesCompra } from '../ControlesCompra';
import type { ILivro } from '@/interfaces/livro';

interface LivroCardProps {
  livro: ILivro;
  quantidadeNoCarrinho: number;
}

export const LivroCard = ({ livro, quantidadeNoCarrinho }: LivroCardProps) => (
  <div key={livro.uuid} className="cartao-livro" data-cy="livro-card">
    {quantidadeNoCarrinho > 0 && (
      <div className="cartao-livro__badge-carrinho" title={`${quantidadeNoCarrinho} no carrinho`}>
        <ShoppingCart size={14} />
        <span>{quantidadeNoCarrinho}</span>
        {quantidadeNoCarrinho > 1 && (
          <span title="Múltiplas unidades no carrinho">
            <AlertCircle size={14} className="cartao-livro__alerta-quantidade" />
          </span>
        )}
      </div>
    )}
    <div className="cartao-livro__capa-container">
      <CapaLivro src={livro.imagem} alt={livro.titulo} titulo={livro.titulo} className="cartao-livro__capa" />
      <div className="cartao-livro__info">
        <h4 className="cartao-livro__titulo">{livro.titulo}</h4>
        <p className="cartao-livro__autor">{livro.autor}</p>
        <div className="cartao-livro__avaliacao">
          {'★'.repeat(livro.estrelas || 0)}
          {'☆'.repeat(5 - (livro.estrelas || 0))}
        </div>
      </div>
    </div>
    <div className="cartao-livro__preco-container">
      <p className="cartao-livro__preco">R$ {livro.preco.toFixed(2).replace('.', ',')}</p>
    </div>
    <div className="cartao-livro__acao">
      <Link href={`/livro/${livro.uuid}`} className="botao btn-secondary">
        Ver Detalhes
      </Link>
      <ControlesCompra livro={livro} variant="card" className="cartao-livro__linha-compra" />
    </div>
  </div>
);
