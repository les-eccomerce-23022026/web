import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { adicionarItem, removerItem, atualizarQuantidade } from '@/store/slices/carrinhoSlice';
import type { ILivro } from '@/interfaces/ILivro';
import './ControlesCompra.css';

interface ControlesCompraProps {
  livro: ILivro;
  variant?: 'card' | 'detalhes';
  className?: string;
  onAction?: (e: React.MouseEvent) => void;
}

export const ControlesCompra: React.FC<ControlesCompraProps> = ({ 
  livro, 
  variant = 'card', 
  className = '',
  onAction 
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const carrinho = useAppSelector((state) => state.carrinho.data);

  const itemNoCarrinho = carrinho?.itens.find(i => i.uuid === livro.uuid);
  const quantidade = itemNoCarrinho ? itemNoCarrinho.quantidade : 0;

  const handleAdicionarAoCarrinho = (e: React.MouseEvent, redirect: boolean = false) => {
    e.stopPropagation();
    if (onAction) onAction(e);

    dispatch(adicionarItem({
      uuid: livro.uuid,
      imagem: livro.imagem || '',
      titulo: livro.titulo,
      isbn: livro.isbn || '',
      precoUnitario: livro.preco,
      quantidade: 1,
      subtotal: livro.preco,
    }));

    if (redirect) {
      navigate('/carrinho');
    }
  };

  const handleAtualizarQuantidade = (e: React.MouseEvent, novaQuantidade: number) => {
    e.stopPropagation();
    if (onAction) onAction(e);

    if (novaQuantidade <= 0) {
      dispatch(removerItem(livro.uuid));
    } else {
      dispatch(atualizarQuantidade({ uuid: livro.uuid, quantidade: novaQuantidade }));
    }
  };

  return (
    <div className={`controles-compra controles-compra--${variant} ${className}`}>
      <div className="controles-compra__ctrl-qtd">
        <button
          className="ctrl-qtd__btn"
          onClick={(e) => handleAtualizarQuantidade(e, quantidade - 1)}
          title="Diminuir quantidade"
          disabled={quantidade === 0}
        >
          <Minus size={variant === 'card' ? 14 : 18} />
        </button>
        <span className="ctrl-qtd__icone">
          <ShoppingCart size={variant === 'card' ? 16 : 20} />
          {quantidade > 0 && <span className="ctrl-qtd__valor">{quantidade}</span>}
        </span>
        <button
          className="ctrl-qtd__btn"
          onClick={(e) => handleAdicionarAoCarrinho(e)}
          title="Aumentar quantidade"
        >
          <Plus size={variant === 'card' ? 14 : 18} />
        </button>
      </div>
      <button
        className={`botao btn-primary controles-compra__btn-comprar`}
        onClick={(e) => handleAdicionarAoCarrinho(e, true)}
      >
        {variant === 'card' ? 'Comprar' : 'Comprar Agora'}
      </button>
    </div>
  );
};
