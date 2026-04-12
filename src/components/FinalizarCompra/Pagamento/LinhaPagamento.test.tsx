import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LinhaPagamento } from './LinhaPagamento';
import type { LinhaPagamentoCheckout } from '@/types/checkout';

const LINHA_PIX: LinhaPagamentoCheckout = { id: '1', tipo: 'pix', valor: 50 };

describe('LinhaPagamento (TDD)', () => {
  const onAtualizar = vi.fn();
  const onRemover = vi.fn();

  it('deve renderizar o tipo de pagamento PIX e o valor', () => {
    render(
      <LinhaPagamento 
        linha={LINHA_PIX}
        totalAposCupons={100}
        todasLinhas={[LINHA_PIX]}
        onAtualizar={onAtualizar}
        onRemover={onRemover}
        novosCartoesPorLinha={{}}
        cartoesSalvos={[]}
      />
    );
    
    expect(screen.getByText('PIX')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
  });

  it('deve chamar onRemover ao clicar no botão de remover', () => {
    render(
      <LinhaPagamento 
        linha={LINHA_PIX}
        totalAposCupons={100}
        todasLinhas={[LINHA_PIX, { id: '2', tipo: 'pix', valor: 50 }]}
        onAtualizar={onAtualizar}
        onRemover={onRemover}
        novosCartoesPorLinha={{}}
        cartoesSalvos={[]}
      />
    );

    fireEvent.click(screen.getByText('Remover'));
    expect(onRemover).toHaveBeenCalledWith('1');
  });

  it('deve chamar onAtualizar ao alterar o valor', () => {
    render(
      <LinhaPagamento 
        linha={LINHA_PIX}
        totalAposCupons={100}
        todasLinhas={[LINHA_PIX]}
        onAtualizar={onAtualizar}
        onRemover={onRemover}
        novosCartoesPorLinha={{}}
        cartoesSalvos={[]}
      />
    );

    const input = screen.getByLabelText('Valor (R$)');
    fireEvent.change(input, { target: { value: '75' } });
    expect(onAtualizar).toHaveBeenCalledWith('1', { valor: 75 });
  });
});
