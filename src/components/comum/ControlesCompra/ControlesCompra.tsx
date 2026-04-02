import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  adicionarItem,
  removerItem,
  atualizarQuantidade,
  sincronizarLinhaCarrinho,
} from '@/store/slices/carrinhoSlice';
import { USE_MOCK } from '@/config/apiConfig';
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
  onAction,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const carrinho = useAppSelector((state) => state.carrinho.data);
  const token = useAppSelector((state) => state.auth.token);

  const itemNoCarrinho = carrinho?.itens.find((i) => i.uuid === livro.uuid);
  const quantidade = itemNoCarrinho ? itemNoCarrinho.quantidade : 0;

  const usarCarrinhoLocal = USE_MOCK || !token;

  const handleAdicionarAoCarrinho = (e: React.MouseEvent, redirect: boolean = false) => {
    e.stopPropagation();
    if (onAction) onAction(e);

    const novaQtd = quantidade + 1;

    if (usarCarrinhoLocal) {
      dispatch(
        adicionarItem({
          uuid: livro.uuid,
          imagem: livro.imagem || '',
          titulo: livro.titulo,
          isbn: livro.isbn || '',
          precoUnitario: livro.preco,
          quantidade: 1,
          subtotal: livro.preco,
        }),
      );
    } else {
      void dispatch(sincronizarLinhaCarrinho({ livroUuid: livro.uuid, quantidade: novaQtd }));
    }

    if (redirect) {
      navigate('/carrinho');
    }
  };

  const handleAtualizarQuantidade = (e: React.MouseEvent, novaQuantidade: number) => {
    e.stopPropagation();
    if (onAction) onAction(e);

    if (novaQuantidade <= 0) {
      if (usarCarrinhoLocal) {
        dispatch(removerItem(livro.uuid));
      } else {
        void dispatch(sincronizarLinhaCarrinho({ livroUuid: livro.uuid, quantidade: 0 }));
      }
      return;
    }

    if (usarCarrinhoLocal) {
      dispatch(atualizarQuantidade({ uuid: livro.uuid, quantidade: novaQuantidade }));
    } else {
      void dispatch(sincronizarLinhaCarrinho({ livroUuid: livro.uuid, quantidade: novaQuantidade }));
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
        data-cy="checkout-buy-button"
      >
        {variant === 'card' ? 'Comprar' : 'Comprar Agora'}
      </button>
    </div>
  );
};
