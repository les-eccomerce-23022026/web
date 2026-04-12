import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartaoResumoPedido } from './CartaoResumoPedido';
import type { IPedido } from '@/interfaces/pedido';
import type { ILivro } from '@/interfaces/livro';

const LIVRO_MOCK: ILivro = {
  uuid: 'l1',
  titulo: 'O Pequeno Príncipe',
  autor: 'Antoine de Saint-Exupéry',
  preco: 29.9,
  imagem: 'https://img.com/capa.jpg',
  isbn: '123',
  estoque: 10
};

const PEDIDO_MOCK: IPedido = {
  uuid: 'ped-1',
  data: '2026-03-01',
  total: 129.9,
  status: 'Entregue',
  usuarioUuid: 'u1',
  itens: [
    { livroUuid: 'l1', quantidade: 1, precoUnitario: 29.9 }
  ]
};

describe('CartaoResumoPedido (TDD)', () => {
  const onVerDetalhes = vi.fn();
  const onSolicitarTroca = vi.fn();

  it('deve renderizar o UUID do pedido e o status', () => {
    render(
      <CartaoResumoPedido 
        pedido={PEDIDO_MOCK} 
        livrosMap={new Map([['l1', LIVRO_MOCK]])} 
        onVerDetalhes={onVerDetalhes}
      />
    );
    
    expect(screen.getByText(/ped-1/)).toBeInTheDocument();
    // O status aparece no badge e na timeline, então usamos getAll
    expect(screen.getAllByText('Entregue').length).toBeGreaterThanOrEqual(1);
  });

  it('deve chamar onVerDetalhes ao clicar no botão de detalhes', () => {
    render(
      <CartaoResumoPedido 
        pedido={PEDIDO_MOCK} 
        livrosMap={new Map([['l1', LIVRO_MOCK]])} 
        onVerDetalhes={onVerDetalhes}
      />
    );

    fireEvent.click(screen.getByText('Ver detalhes'));
    expect(onVerDetalhes).toHaveBeenCalledWith(PEDIDO_MOCK);
  });

  it('deve exibir botão de solicitar troca se o status for Entregue', () => {
    render(
      <CartaoResumoPedido 
        pedido={PEDIDO_MOCK} 
        livrosMap={new Map([['l1', LIVRO_MOCK]])} 
        onVerDetalhes={onVerDetalhes}
        onSolicitarTroca={onSolicitarTroca}
      />
    );

    expect(screen.getByText('Solicitar troca')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Solicitar troca'));
    expect(onSolicitarTroca).toHaveBeenCalledWith(PEDIDO_MOCK.uuid);
  });
});
