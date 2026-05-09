/**
 * Testes RTL para CheckoutSplitPagamento
 * Valida comportamento crítico de split de pagamento
 */

/* eslint-disable max-lines */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { CheckoutSplitPagamento } from './CheckoutSplitPagamento';
// eslint-disable-next-line no-restricted-imports
import { POLITICA_PARCELAMENTO_CARTAO_PADRAO } from '../../../interfaces/pagamento';
// eslint-disable-next-line no-restricted-imports
import type { ICheckoutInfo } from '../../../interfaces/checkout';
// eslint-disable-next-line no-restricted-imports
import type { LinhaPagamentoCheckout } from '../../../types/checkout';
// eslint-disable-next-line no-restricted-imports
import type { ICupomAplicado } from '../../../interfaces/pagamento';
// eslint-disable-next-line no-restricted-imports
import type { ICartaoCreditoInput } from '../../../interfaces/pagamento';
// eslint-disable-next-line no-restricted-imports
import type { IResumoPedidoCheckout } from '../../../interfaces/checkout';

describe('CheckoutSplitPagamento', () => {
  const mockOnLinhasChange = vi.fn();
  const mockOnAbrirModalCartao = vi.fn();

  const mockResumo: IResumoPedidoCheckout = {
    quantidadeItens: 1,
    subtotal: 100.0,
    frete: 10.0,
    descontoCupons: 0,
    total: 110.0,
  };

  const mockData: ICheckoutInfo = {
    enderecoEntrega: null,
    enderecosDisponiveis: [],
    cartoesSalvos: [
      {
        uuid: 'cartao-1',
        ultimosDigitosCartao: '1234',
        nomeCliente: 'Cliente Teste',
        nomeImpresso: 'CLIENTE TESTE',
        bandeira: 'Visa',
        validade: '12/30',
        principal: true,
      },
    ],
    cuponsDisponiveis: [],
    bandeirasPermitidas: ['Visa', 'Mastercard'],
    freteOpcoes: [],
    politicaParcelamentoCartao: POLITICA_PARCELAMENTO_CARTAO_PADRAO,
    resumoPedido: mockResumo,
  };

  const mockLinhas: LinhaPagamentoCheckout[] = [
    {
      id: 'linha-1',
      tipo: 'cartao_salvo',
      cartaoSalvoUuid: 'cartao-1',
      valor: 100.0,
      parcelasCartao: 1,
    },
  ];

  const mockCupons: ICupomAplicado[] = [];
  const mockNovosCartoes: Record<string, ICartaoCreditoInput> = {};

  beforeEach(() => {
    mockOnLinhasChange.mockClear();
    mockOnAbrirModalCartao.mockClear();
  });

  describe('Renderização', () => {
    it('deve renderizar título da seção', () => {
      render(
        <CheckoutSplitPagamento
          data={mockData}
          totalAposCupons={100.0}
          cuponsAplicados={mockCupons}
          linhas={mockLinhas}
          novosCartoesPorLinha={mockNovosCartoes}
          onLinhasChange={mockOnLinhasChange}
          onAbrirModalCartao={mockOnAbrirModalCartao}
        />,
      );

      expect(screen.getByTestId('checkout-split-title')).toBeInTheDocument();
    });

    it('deve renderizar informações sobre PIX', () => {
      render(
        <CheckoutSplitPagamento
          data={mockData}
          totalAposCupons={100.0}
          cuponsAplicados={mockCupons}
          linhas={mockLinhas}
          novosCartoesPorLinha={mockNovosCartoes}
          onLinhasChange={mockOnLinhasChange}
          onAbrirModalCartao={mockOnAbrirModalCartao}
        />,
      );

      expect(screen.getByTestId('checkout-split-description')).toBeInTheDocument();
    });

    it('deve renderizar resumo de cobertura', () => {
      render(
        <CheckoutSplitPagamento
          data={mockData}
          totalAposCupons={100.0}
          cuponsAplicados={mockCupons}
          linhas={mockLinhas}
          novosCartoesPorLinha={mockNovosCartoes}
          onLinhasChange={mockOnLinhasChange}
          onAbrirModalCartao={mockOnAbrirModalCartao}
        />,
      );

      expect(screen.getByTestId('checkout-split-restante')).toBeInTheDocument();
    });

    it('deve renderizar toolbar de ações', () => {
      render(
        <CheckoutSplitPagamento
          data={mockData}
          totalAposCupons={100.0}
          cuponsAplicados={mockCupons}
          linhas={mockLinhas}
          novosCartoesPorLinha={mockNovosCartoes}
          onLinhasChange={mockOnLinhasChange}
          onAbrirModalCartao={mockOnAbrirModalCartao}
        />,
      );

      expect(screen.getByTestId('checkout-split-toolbar')).toBeInTheDocument();
    });
  });

  describe('RN0034 - Valor Mínimo por Meio', () => {
    it('deve exibir erro quando valor abaixo do mínimo em split', () => {
      const linhasAbaixoMinimo: LinhaPagamentoCheckout[] = [
        {
          id: 'linha-1',
          tipo: 'cartao_salvo',
          cartaoSalvoUuid: 'cartao-1',
          valor: 5.0,
          parcelasCartao: 1,
        },
      ];

      render(
        <CheckoutSplitPagamento
          data={mockData}
          totalAposCupons={100.0}
          cuponsAplicados={mockCupons}
          linhas={linhasAbaixoMinimo}
          novosCartoesPorLinha={mockNovosCartoes}
          onLinhasChange={mockOnLinhasChange}
          onAbrirModalCartao={mockOnAbrirModalCartao}
        />,
      );

      expect(screen.getByTestId('checkout-split-rn34-error')).toBeInTheDocument();
    });

    it('não deve exibir erro quando valores estão acima do mínimo', () => {
      render(
        <CheckoutSplitPagamento
          data={mockData}
          totalAposCupons={100.0}
          cuponsAplicados={mockCupons}
          linhas={mockLinhas}
          novosCartoesPorLinha={mockNovosCartoes}
          onLinhasChange={mockOnLinhasChange}
          onAbrirModalCartao={mockOnAbrirModalCartao}
        />,
      );

      expect(screen.queryByTestId('checkout-split-rn34-error')).not.toBeInTheDocument();
    });
  });

  describe('Cálculo de Cobertura', () => {
    it('deve calcular corretamente quando linhas cobrem total', () => {
      render(
        <CheckoutSplitPagamento
          data={mockData}
          totalAposCupons={100.0}
          cuponsAplicados={mockCupons}
          linhas={mockLinhas}
          novosCartoesPorLinha={mockNovosCartoes}
          onLinhasChange={mockOnLinhasChange}
          onAbrirModalCartao={mockOnAbrirModalCartao}
        />,
      );

      const restante = screen.getByTestId('checkout-split-restante');
      expect(restante.textContent).toContain('0');
    });

    it('deve calcular restante quando linhas não cobrem total', () => {
      const linhasIncompletas: LinhaPagamentoCheckout[] = [
        {
          id: 'linha-1',
          tipo: 'cartao_salvo',
          cartaoSalvoUuid: 'cartao-1',
          valor: 50.0,
          parcelasCartao: 1,
        },
      ];

      render(
        <CheckoutSplitPagamento
          data={mockData}
          totalAposCupons={100.0}
          cuponsAplicados={mockCupons}
          linhas={linhasIncompletas}
          novosCartoesPorLinha={mockNovosCartoes}
          onLinhasChange={mockOnLinhasChange}
          onAbrirModalCartao={mockOnAbrirModalCartao}
        />,
      );

      const restante = screen.getByTestId('checkout-split-restante');
      expect(restante.textContent).not.toContain('0');
    });
  });

  describe('Múltiplas Linhas', () => {
    it('deve renderizar múltiplas linhas quando fornecidas', () => {
      const multiplasLinhas: LinhaPagamentoCheckout[] = [
        {
          id: 'linha-1',
          tipo: 'cartao_salvo',
          cartaoSalvoUuid: 'cartao-1',
          valor: 50.0,
          parcelasCartao: 1,
        },
        {
          id: 'linha-2',
          tipo: 'pix',
          valor: 50.0,
        },
      ];

      render(
        <CheckoutSplitPagamento
          data={mockData}
          totalAposCupons={100.0}
          cuponsAplicados={mockCupons}
          linhas={multiplasLinhas}
          novosCartoesPorLinha={mockNovosCartoes}
          onLinhasChange={mockOnLinhasChange}
          onAbrirModalCartao={mockOnAbrirModalCartao}
        />,
      );

      expect(screen.getAllByTestId(/checkout-split-line-/i)).toHaveLength(2);
    });
  });
});
