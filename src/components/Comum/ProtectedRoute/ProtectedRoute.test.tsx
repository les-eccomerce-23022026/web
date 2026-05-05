import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';

// Mocks
const mockUseAppSelector = vi.fn();
const mockHasPermission = vi.fn();
const mockRouterReplace = vi.fn();

vi.mock('@/store/hooks', () => ({
  useAppSelector: (fn: (state: unknown) => unknown) => mockUseAppSelector(fn),
}));

vi.mock('@/hooks/useAuthorization', () => ({
  useAuthorization: () => ({
    hasPermission: mockHasPermission,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
  }),
}));

vi.mock('../LoadingState/LoadingState', () => ({
  LoadingState: () => <div data-testid="loading">Carregando...</div>,
}));

describe('ProtectedRoute (Unidade)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exibir LoadingState quando a sessão estiver carregando', () => {
    mockUseAppSelector.mockReturnValue({ isAuthenticated: false, sessionLoading: true });
    
    render(
      <ProtectedRoute>
        <div>Conteúdo Protegido</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('deve redirecionar para /minha-conta quando o usuário não estiver autenticado', () => {
    mockUseAppSelector.mockReturnValue({ isAuthenticated: false, sessionLoading: false });

    render(
      <ProtectedRoute>
        <div>Conteúdo Protegido</div>
      </ProtectedRoute>
    );

    expect(mockRouterReplace).toHaveBeenCalledWith('/minha-conta');
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('deve redirecionar para / quando o usuário não tiver a permissão exigida', () => {
    mockUseAppSelector.mockReturnValue({ isAuthenticated: true, sessionLoading: false });
    mockHasPermission.mockReturnValue(false);

    render(
      <ProtectedRoute requireAction="manage_users">
        <div>Conteúdo Protegido</div>
      </ProtectedRoute>
    );

    expect(mockRouterReplace).toHaveBeenCalledWith('/');
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('deve permitir acesso ao conteúdo quando autenticado e com permissão', () => {
    mockUseAppSelector.mockReturnValue({ isAuthenticated: true, sessionLoading: false });
    mockHasPermission.mockReturnValue(true);

    render(
      <ProtectedRoute>
        <div>Conteúdo Protegido</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});
