import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnderecoForm } from './EnderecoForm';

describe('EnderecoForm (TDD)', () => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  it('deve renderizar campos vazios por padrão', () => {
    render(<EnderecoForm onSubmit={onSubmit} onCancel={onCancel} />);

    expect(screen.getByLabelText(/Logradouro/i)).toHaveValue('');
    expect(screen.getByLabelText(/Número/i)).toHaveValue('');
    expect(screen.getByLabelText(/CEP/i)).toHaveValue('');
  });

  it('deve preencher campos com initialData', () => {
    const initialData = {
      logradouro: 'Rua Teste',
      numero: '123',
      cep: '12345-678',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP'
    };

    render(<EnderecoForm initialData={initialData} onSubmit={onSubmit} onCancel={onCancel} />);

    expect(screen.getByLabelText(/Logradouro/i)).toHaveValue('Rua Teste');
    expect(screen.getByLabelText(/Número/i)).toHaveValue('123');
    expect(screen.getByLabelText(/CEP/i)).toHaveValue('12345-678');
  });

  it('deve chamar onSubmit com os dados do formulário ao clicar em salvar', async () => {
    render(<EnderecoForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.change(screen.getByLabelText(/Logradouro/i), { target: { value: 'Nova Rua' } });
    fireEvent.change(screen.getByLabelText(/Número/i), { target: { value: '456' } });
    fireEvent.change(screen.getByLabelText(/Bairro/i), { target: { value: 'Novo Bairro' } });
    fireEvent.change(screen.getByLabelText(/CEP/i), { target: { value: '01001-000' } });
    fireEvent.change(screen.getByLabelText(/Cidade/i), { target: { value: 'São Paulo' } });
    fireEvent.change(screen.getByLabelText(/Estado/i), { target: { value: 'SP' } });

    fireEvent.click(screen.getByText(/Salvar/i));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        logradouro: 'Nova Rua',
        numero: '456',
        complemento: '',
        bairro: 'Novo Bairro',
        cep: '01001-000',
        cidade: 'São Paulo',
        estado: 'SP',
        tipo: 'ambos'
      });
    });
  });

  it('deve chamar onCancel ao clicar em cancelar', () => {
    render(<EnderecoForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.click(screen.getByText(/Cancelar/i));
    expect(onCancel).toHaveBeenCalled();
  });
});
