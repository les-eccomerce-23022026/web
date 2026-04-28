import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mocks
const mockUseAppSelector = vi.fn();
const mockHasPermission = vi.fn();

vi.mock('@/store/hooks', () => ({
  useAppSelector: (fn: any) => mockUseAppSelector(fn),
}));

vi.mock('@/hooks/useAuthorization', () => ({
  useAuthorization: () => ({
    hasPermission: mockHasPermission,
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
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<div>Conteúdo Protegido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('deve redirecionar para /minha-conta quando o usuário não estiver autenticado', () => {
    mockUseAppSelector.mockReturnValue({ isAuthenticated: false, sessionLoading: false });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<div>Conteúdo Protegido</div>} />
          </Route>
          <Route path="/minha-conta" element={<div>Tela de Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Tela de Login')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
  });

  it('deve redirecionar para / quando o usuário não tiver a permissão exigida', () => {
    mockUseAppSelector.mockReturnValue({ isAuthenticated: true, sessionLoading: false });
    mockHasPermission.mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<ProtectedRoute requireAction="GERENCIAR_PEDIDOS" />}>
            <Route path="/admin" element={<div>Conteúdo Protegido</div>} />
          </Route>
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('deve permitir acesso ao conteúdo (Outlet) quando autenticado e com permissão', () => {
    mockUseAppSelector.mockReturnValue({ isAuthenticated: true, sessionLoading: false });
    mockHasPermission.mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<div>Conteúdo Protegido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });
});
