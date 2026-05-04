import { describe, it, expect } from 'vitest';
import { mapearErroUsuario } from './mapearErro';

describe('mapearErroUsuario', () => {
  it('deve retornar mensagem genérica para Error conhecido com mensagem técnica', () => {
    const err = new Error('Internal Server Error: Database connection failed');
    const result = mapearErroUsuario(err);
    expect(result).toBe('Ocorreu um erro ao processar sua solicitação. Tente novamente.');
  });

  it('deve retornar mensagem genérica para string vazia', () => {
    const result = mapearErroUsuario('');
    expect(result).toBe('Ocorreu um erro inesperado. Tente novamente.');
  });

  it('deve retornar mensagem genérica para objeto desconhecido', () => {
    const result = mapearErroUsuario({ code: 500, details: 'stack trace here' });
    expect(result).toBe('Ocorreu um erro inesperado. Tente novamente.');
  });

  it('deve retornar mensagem genérica para null', () => {
    const result = mapearErroUsuario(null);
    expect(result).toBe('Ocorreu um erro inesperado. Tente novamente.');
  });

  it('deve retornar mensagem genérica para undefined', () => {
    const result = mapearErroUsuario(undefined);
    expect(result).toBe('Ocorreu um erro inesperado. Tente novamente.');
  });

  it('deve tratar erro de rede "Failed to fetch" com mensagem específica', () => {
    const err = new Error('Failed to fetch');
    const result = mapearErroUsuario(err);
    expect(result).toBe('Erro de conexão. Verifique sua internet e tente novamente.');
  });

  it('deve tratar erro de rede "NetworkError" com mensagem específica', () => {
    const err = new Error('NetworkError');
    const result = mapearErroUsuario(err);
    expect(result).toBe('Erro de conexão. Verifique sua internet e tente novamente.');
  });

  it('deve sanitizar mensagens que contenham detalhes técnicos sensíveis', () => {
    const err = new Error('SQL injection attempt detected in query: SELECT * FROM users');
    const result = mapearErroUsuario(err);
    expect(result).not.toContain('SQL');
    expect(result).not.toContain('SELECT');
    expect(result).not.toContain('users');
  });

  it('deve retornar mensagem genérica para número', () => {
    const result = mapearErroUsuario(500);
    expect(result).toBe('Ocorreu um erro inesperado. Tente novamente.');
  });

  it('deve retornar mensagem genérica para array', () => {
    const result = mapearErroUsuario(['error1', 'error2']);
    expect(result).toBe('Ocorreu um erro inesperado. Tente novamente.');
  });

  it('deve preservar mensagens de negócio sobre pagamento recusado', () => {
    const err = new Error('Pagamento recusado pelo banco');
    const result = mapearErroUsuario(err);
    expect(result).toBe('Pagamento recusado pelo banco');
  });

  it('deve preservar mensagens de negócio sobre campos inválidos', () => {
    const err = new Error('CEP inválido');
    const result = mapearErroUsuario(err);
    expect(result).toBe('CEP inválido');
  });

  it('deve preservar mensagens de negócio sobre campos obrigatórios', () => {
    const err = new Error('Campo obrigatório');
    const result = mapearErroUsuario(err);
    expect(result).toBe('Campo obrigatório');
  });
});
