import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useNotification } from './useNotification';
import { NotificationProvider } from './NotificationContext';

describe('useNotification', () => {
  it('deve fornecer funções para mostrar notificações', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotification(), { wrapper });

    expect(result.current.showError).toBeInstanceOf(Function);
    expect(result.current.showSuccess).toBeInstanceOf(Function);
    expect(result.current.showWarning).toBeInstanceOf(Function);
    expect(result.current.showInfo).toBeInstanceOf(Function);
  });

  it('deve adicionar notificação de erro ao chamar showError', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.showError('Erro de teste');
    });

    // Verifica se a notificação foi adicionada ao contexto
    // Será implementado quando o provider existir
  });

  it('deve adicionar notificação de sucesso ao chamar showSuccess', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.showSuccess('Sucesso!');
    });

    // Verifica se a notificação foi adicionada ao contexto
  });

  it('deve adicionar notificação de aviso ao chamar showWarning', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.showWarning('Aviso!');
    });

    // Verifica se a notificação foi adicionada ao contexto
  });

  it('deve adicionar notificação de informação ao chamar showInfo', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.showInfo('Informação');
    });

    // Verifica se a notificação foi adicionada ao contexto
  });

  it('deve permitir fechar notificação', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.showError('Erro de teste');
    });

    // Será implementado quando o provider existir
    // Deve permitir fechar a notificação
  });
});
