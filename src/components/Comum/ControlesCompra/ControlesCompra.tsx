import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { adicionarUmAoCarrinho, definirQuantidadeCarrinho } from './controlesCompraCarrinho';
import { ControlesCompraQuantidade } from './ControlesCompraQuantidade';
import { USE_MOCK } from '@/config/apiConfig';
import type { ILivro } from '@/interfaces/livro';
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
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const itemNoCarrinho = carrinho?.itens.find((i) => i.uuid === livro.uuid);
  const quantidade = itemNoCarrinho ? itemNoCarrinho.quantidade : 0;

  const usarCarrinhoLocal = USE_MOCK || !isAuthenticated;

  const handleAdicionarAoCarrinho = (e: React.MouseEvent, redirect: boolean = false) => {
    e.stopPropagation();
    if (onAction) onAction(e);
    adicionarUmAoCarrinho(dispatch, usarCarrinhoLocal, livro, quantidade);
    if (redirect) {
      navigate('/carrinho');
    }
  };

  const handleAtualizarQuantidade = (e: React.MouseEvent, novaQuantidade: number) => {
    e.stopPropagation();
    if (onAction) onAction(e);
    definirQuantidadeCarrinho(dispatch, usarCarrinhoLocal, livro, novaQuantidade);
  };

  return (
    <div className={`controles-compra controles-compra--${variant} ${className}`}>
      <ControlesCompraQuantidade
        variant={variant}
        quantidade={quantidade}
        onDiminuir={(e) => handleAtualizarQuantidade(e, quantidade - 1)}
        onAumentar={(e) => handleAdicionarAoCarrinho(e)}
      />
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
