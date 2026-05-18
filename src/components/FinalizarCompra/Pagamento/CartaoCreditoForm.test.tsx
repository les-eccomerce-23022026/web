/**
 * Testes RTL para CartaoCreditoForm
 * Valida formulário de cartão de crédito
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { CartaoCreditoForm } from './CartaoCreditoForm';

describe('CartaoCreditoForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    bandeirasPermitidas: ['Visa', 'Mastercard'],
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    salvarCartao: false,
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Renderização', () => {
    it('deve renderizar formulário', () => {
      render(<CartaoCreditoForm {...defaultProps} />);

      expect(screen.getByText(/Novo Cartão de Crédito/i)).toBeInTheDocument();
    });

    it('deve renderizar campos do cartão', () => {
      render(<CartaoCreditoForm {...defaultProps} />);

      expect(screen.getByLabelText(/Número do Cartão/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nome do Titular/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Validade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/CVV/i)).toBeInTheDocument();
    });

    it('deve renderizar checkbox salvar cartão quando salvarCartao=true', () => {
      render(<CartaoCreditoForm {...defaultProps} salvarCartao={true} />);

      expect(screen.getByLabelText(/Salvar cartão/i)).toBeInTheDocument();
    });

    it('deve renderizar botão cancelar quando onCancel fornecido', () => {
      render(<CartaoCreditoForm {...defaultProps} onCancel={mockOnCancel} />);

      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    });

    it('deve exibir dica quando dicaSalvarCartaoOpcional fornecida', () => {
      render(
        <CartaoCreditoForm
          {...defaultProps}
          salvarCartao={true}
          dicaSalvarCartaoOpcional="Salve para compras futuras"
        />,
      );

      expect(screen.getByText(/Salve para compras futuras/i)).toBeInTheDocument();
    });
  });

  describe('Validação', () => {
    it('deve chamar onSubmit com dados corretos', () => {
      render(<CartaoCreditoForm {...defaultProps} />);

      fireEvent.change(screen.getByLabelText(/Número do Cartão/i), {
        target: { value: '4111111111111111' },
      });
      fireEvent.change(screen.getByLabelText(/Nome do Titular/i), {
        target: { value: 'CLIENTE TESTE' },
      });
      fireEvent.change(screen.getByLabelText(/Validade/i), {
        target: { value: '12/30' },
      });
      fireEvent.change(screen.getByLabelText(/CVV/i), {
        target: { value: '123' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Adicionar Cartão' }));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        numero: '4111111111111111',
        nomeTitular: 'CLIENTE TESTE',
        validade: '12/30',
        cvv: '123',
        bandeira: expect.any(String),
        salvarCartao: false,
      });
    });

    it('deve chamar onCancel ao clicar no botão cancelar', () => {
      render(<CartaoCreditoForm {...defaultProps} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Bandeiras', () => {
    it('deve respeitar bandeiras permitidas', () => {
      render(
        <CartaoCreditoForm {...defaultProps} bandeirasPermitidas={['Visa']} />,
      );

      // Testar com número Visa
      fireEvent.change(screen.getByLabelText(/Número do Cartão/i), {
        target: { value: '4111111111111111' },
      });

      // Deve detectar bandeira Visa
      fireEvent.change(screen.getByLabelText(/Nome do Titular/i), {
        target: { value: 'CLIENTE TESTE' },
      });
      fireEvent.change(screen.getByLabelText(/Validade/i), {
        target: { value: '12/30' },
      });
      fireEvent.change(screen.getByLabelText(/CVV/i), {
        target: { value: '123' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Adicionar Cartão' }));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          bandeira: 'Visa',
        }),
      );
    });
  });
});
