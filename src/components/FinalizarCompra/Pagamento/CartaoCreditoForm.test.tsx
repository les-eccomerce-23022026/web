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

      expect(screen.getByTestId('checkout-new-card-form')).toBeInTheDocument();
    });

    it('deve renderizar campos do cartão', () => {
      render(<CartaoCreditoForm {...defaultProps} />);

      expect(screen.getByTestId('checkout-card-number-input')).toBeInTheDocument();
      expect(screen.getByTestId('checkout-card-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('checkout-card-expiry-input')).toBeInTheDocument();
      expect(screen.getByTestId('checkout-card-cvv-input')).toBeInTheDocument();
    });

    it('deve renderizar checkbox salvar cartão quando salvarCartao=true', () => {
      render(<CartaoCreditoForm {...defaultProps} salvarCartao={true} />);

      expect(screen.getByTestId('checkout-card-save-checkbox')).toBeInTheDocument();
    });

    it('deve renderizar botão cancelar quando onCancel fornecido', () => {
      render(<CartaoCreditoForm {...defaultProps} onCancel={mockOnCancel} />);

      expect(screen.getByTestId('checkout-card-cancel-button')).toBeInTheDocument();
    });

    it('deve exibir dica quando dicaSalvarCartaoOpcional fornecida', () => {
      render(
        <CartaoCreditoForm
          {...defaultProps}
          salvarCartao={true}
          dicaSalvarCartaoOpcional="Salve para compras futuras"
        />,
      );

      expect(screen.getByTestId('checkout-card-save-hint')).toBeInTheDocument();
    });
  });

  describe('Validação', () => {
    it('deve chamar onSubmit com dados corretos', () => {
      render(<CartaoCreditoForm {...defaultProps} />);

      fireEvent.change(screen.getByTestId('checkout-card-number-input'), {
        target: { value: '4111111111111111' },
      });
      fireEvent.change(screen.getByTestId('checkout-card-name-input'), {
        target: { value: 'CLIENTE TESTE' },
      });
      fireEvent.change(screen.getByTestId('checkout-card-expiry-input'), {
        target: { value: '12/30' },
      });
      fireEvent.change(screen.getByTestId('checkout-card-cvv-input'), {
        target: { value: '123' },
      });

      fireEvent.click(screen.getByTestId('checkout-card-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        numero: '4111111111111111',
        nomeTitular: 'CLIENTE TESTE',
        validade: '12/30',
        cvv: '123',
        bandeira: expect.any(String),
        salvarCartao: false,
      });
    });

    it('deve incluir salvarCartao quando checkbox marcado', () => {
      render(<CartaoCreditoForm {...defaultProps} salvarCartao={true} />);

      fireEvent.change(screen.getByTestId('checkout-card-number-input'), {
        target: { value: '4111111111111111' },
      });
      fireEvent.change(screen.getByTestId('checkout-card-name-input'), {
        target: { value: 'CLIENTE TESTE' },
      });
      fireEvent.change(screen.getByTestId('checkout-card-expiry-input'), {
        target: { value: '12/30' },
      });
      fireEvent.change(screen.getByTestId('checkout-card-cvv-input'), {
        target: { value: '123' },
      });
      fireEvent.click(screen.getByTestId('checkout-card-save-checkbox'));

      fireEvent.click(screen.getByTestId('checkout-card-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          salvarCartao: true,
        }),
      );
    });

    it('deve chamar onCancel ao clicar no botão cancelar', () => {
      render(<CartaoCreditoForm {...defaultProps} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByTestId('checkout-card-cancel-button'));

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Bandeiras', () => {
    it('deve respeitar bandeiras permitidas', () => {
      render(
        <CartaoCreditoForm {...defaultProps} bandeirasPermitidas={['Visa']} />,
      );

      // Testar com número Visa
      fireEvent.change(screen.getByTestId('checkout-card-number-input'), {
        target: { value: '4111111111111111' },
      });

      // Deve detectar bandeira Visa
      fireEvent.change(screen.getByTestId('checkout-card-name-input'), {
        target: { value: 'CLIENTE TESTE' },
      });
      fireEvent.change(screen.getByTestId('checkout-card-expiry-input'), {
        target: { value: '12/30' },
      });
      fireEvent.change(screen.getByTestId('checkout-card-cvv-input'), {
        target: { value: '123' },
      });

      fireEvent.click(screen.getByTestId('checkout-card-submit-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          bandeira: 'Visa',
        }),
      );
    });
  });
});
