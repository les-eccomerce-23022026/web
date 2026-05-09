/**
 * Testes RTL para LinhaPagamentoConfiguracao
 * Valida RN0069: Parcelamento mínimo R$ 80,00
 */

/* eslint-disable max-lines */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { LinhaPagamentoConfiguracao } from './LinhaPagamentoConfiguracao';
// eslint-disable-next-line no-restricted-imports
import { POLITICA_PARCELAMENTO_CARTAO_PADRAO } from '../../../interfaces/pagamento';
// eslint-disable-next-line no-restricted-imports
import type { LinhaPagamentoCheckout } from '../../../types/checkout';

describe('LinhaPagamentoConfiguracao', () => {
  const mockOnAtualizarLinha = vi.fn();

  const linhaCartao: LinhaPagamentoCheckout = {
    id: 'linha-1',
    tipo: 'cartao_salvo',
    cartaoSalvoUuid: 'cartao-uuid-1',
    valor: 100.0,
    parcelasCartao: 1,
  };

  const linhaPix: LinhaPagamentoCheckout = {
    id: 'linha-2',
    tipo: 'pix',
    valor: 50.0,
  };

  beforeEach(() => {
    mockOnAtualizarLinha.mockClear();
  });

  describe('Renderização', () => {
    it('deve renderizar select de parcelas para linha de cartão', () => {
      render(
        <LinhaPagamentoConfiguracao
          linha={linhaCartao}
          politicaParcelamento={POLITICA_PARCELAMENTO_CARTAO_PADRAO}
          abaixoMin={false}
          onAtualizarLinha={mockOnAtualizarLinha}
        />,
      );

      expect(screen.getByLabelText(/Parcelas no cartão/i)).toBeInTheDocument();
    });

    it('não deve renderizar select de parcelas para linha PIX', () => {
      render(
        <LinhaPagamentoConfiguracao
          linha={linhaPix}
          politicaParcelamento={POLITICA_PARCELAMENTO_CARTAO_PADRAO}
          abaixoMin={false}
          onAtualizarLinha={mockOnAtualizarLinha}
        />,
      );

      expect(screen.queryByLabelText(/Parcelas no cartão/i)).not.toBeInTheDocument();
    });

    it('deve renderizar input de valor', () => {
      render(
        <LinhaPagamentoConfiguracao
          linha={linhaCartao}
          politicaParcelamento={POLITICA_PARCELAMENTO_CARTAO_PADRAO}
          abaixoMin={false}
          onAtualizarLinha={mockOnAtualizarLinha}
        />,
      );

      expect(screen.getByLabelText(/Valor \(R\$\)/i)).toBeInTheDocument();
    });

    it('deve exibir ícone de erro quando abaixoMin=true', () => {
      render(
        <LinhaPagamentoConfiguracao
          linha={linhaCartao}
          politicaParcelamento={POLITICA_PARCELAMENTO_CARTAO_PADRAO}
          abaixoMin={true}
          onAtualizarLinha={mockOnAtualizarLinha}
        />,
      );

      const erroIcon = screen.getByTestId('parcelas-error-icon');
      expect(erroIcon).toBeInTheDocument();
    });

    it('deve marcar input como inválido quando abaixoMin=true', () => {
      render(
        <LinhaPagamentoConfiguracao
          linha={linhaCartao}
          politicaParcelamento={POLITICA_PARCELAMENTO_CARTAO_PADRAO}
          abaixoMin={true}
          onAtualizarLinha={mockOnAtualizarLinha}
        />,
      );

      const valorInput = screen.getByLabelText(/Valor \(R\$\)/i);
      expect(valorInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('RN0069 - Parcelamento Mínimo', () => {
    it('deve exibir apenas opção à vista quando valor < R$ 80,00', () => {
      const linhaBaixoValor: LinhaPagamentoCheckout = {
        ...linhaCartao,
        valor: 50.0,
      };

      render(
        <LinhaPagamentoConfiguracao
          linha={linhaBaixoValor}
          politicaParcelamento={POLITICA_PARCELAMENTO_CARTAO_PADRAO}
          abaixoMin={false}
          onAtualizarLinha={mockOnAtualizarLinha}
        />,
      );

      screen.getByTestId('checkout-parcelas-select');
      const options = screen.getAllByRole('option');

      expect(options).toHaveLength(1);
      expect(options[0].textContent).toContain('à vista');
    });

    it('deve exibir múltiplas opções quando valor >= R$ 80,00', () => {
      render(
        <LinhaPagamentoConfiguracao
          linha={linhaCartao}
          politicaParcelamento={POLITICA_PARCELAMENTO_CARTAO_PADRAO}
          abaixoMin={false}
          onAtualizarLinha={mockOnAtualizarLinha}
        />,
      );

      screen.getByTestId('checkout-parcelas-select');
      const options = screen.getAllByRole('option');

      expect(options.length).toBeGreaterThan(1);
    });

    it('deve exibir apenas opção à vista no limite R$ 79,99', () => {
      const linhaLimite: LinhaPagamentoCheckout = {
        ...linhaCartao,
        valor: 79.99,
      };

      render(
        <LinhaPagamentoConfiguracao
          linha={linhaLimite}
          politicaParcelamento={POLITICA_PARCELAMENTO_CARTAO_PADRAO}
          abaixoMin={false}
          onAtualizarLinha={mockOnAtualizarLinha}
        />,
      );

      screen.getByTestId('checkout-parcelas-select');
      const options = screen.getAllByRole('option');

      expect(options).toHaveLength(1);
    });

    it('deve exibir múltiplas opções a partir de R$ 80,00', () => {
      const linhaMinimo: LinhaPagamentoCheckout = {
        ...linhaCartao,
        valor: 80.0,
      };

      render(
        <LinhaPagamentoConfiguracao
          linha={linhaMinimo}
          politicaParcelamento={POLITICA_PARCELAMENTO_CARTAO_PADRAO}
          abaixoMin={false}
          onAtualizarLinha={mockOnAtualizarLinha}
        />,
      );

      screen.getByTestId('checkout-parcelas-select');
      const options = screen.getAllByRole('option');

      expect(options.length).toBeGreaterThan(1);
    });
  });

  describe('Interação', () => {
    it('deve chamar onAtualizarLinha ao mudar valor', () => {
      render(
        <LinhaPagamentoConfiguracao
          linha={linhaCartao}
          politicaParcelamento={POLITICA_PARCELAMENTO_CARTAO_PADRAO}
          abaixoMin={false}
          onAtualizarLinha={mockOnAtualizarLinha}
        />,
      );

      const valorInput = screen.getByLabelText(/Valor \(R\$\)/i);
      fireEvent.change(valorInput, { target: { value: '150.00' } });

      expect(mockOnAtualizarLinha).toHaveBeenCalledWith('linha-1', {
        valor: 150.0,
      });
    });

    it('deve chamar onAtualizarLinha ao mudar parcelas', () => {
      render(
        <LinhaPagamentoConfiguracao
          linha={linhaCartao}
          politicaParcelamento={POLITICA_PARCELAMENTO_CARTAO_PADRAO}
          abaixoMin={false}
          onAtualizarLinha={mockOnAtualizarLinha}
        />,
      );

      const parcelasSelect = screen.getByTestId('checkout-parcelas-select');
      fireEvent.change(parcelasSelect, { target: { value: '3' } });

      expect(mockOnAtualizarLinha).toHaveBeenCalledWith('linha-1', {
        parcelasCartao: 3,
      });
    });

    it('deve tratar valor inválido como 0', () => {
      render(
        <LinhaPagamentoConfiguracao
          linha={linhaCartao}
          politicaParcelamento={POLITICA_PARCELAMENTO_CARTAO_PADRAO}
          abaixoMin={false}
          onAtualizarLinha={mockOnAtualizarLinha}
        />,
      );

      const valorInput = screen.getByLabelText(/Valor \(R\$\)/i);
      fireEvent.change(valorInput, { target: { value: 'invalid' } });

      expect(mockOnAtualizarLinha).toHaveBeenCalledWith('linha-1', {
        valor: 0,
      });
    });
  });
});
