import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormInput } from './FormInput';

describe('FormInput (Unidade)', () => {
  it('deve renderizar o input com a label correta', () => {
    render(<FormInput label="Nome Completo" placeholder="Digite seu nome" />);
    
    expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite seu nome')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro quando informada', () => {
    render(<FormInput label="E-mail" error="E-mail inválido" />);
    
    expect(screen.getByText('E-mail inválido')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true');
  });

  it('deve marcar o campo como obrigatório quando a prop required for true', () => {
    render(<FormInput label="Senha" required />);
    
    const input = screen.getByLabelText(/Senha/i);
    expect(input).toBeRequired();
  });

  it('deve repassar classes customizadas para o input', () => {
    render(<FormInput label="Teste" inputClassName="custom-input-class" />);
    
    expect(screen.getByLabelText('Teste')).toHaveClass('custom-input-class');
  });
});
