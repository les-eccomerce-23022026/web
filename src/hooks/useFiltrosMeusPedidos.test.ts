import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFiltrosMeusPedidos } from './useFiltrosMeusPedidos';
import type { IPedido } from '@/interfaces/pedido';

const PEDIDOS_MOCK: IPedido[] = [
  { uuid: '1', status: 'Aguardando Pagamento', data: '2026-03-01', total: 100, itens: [], clienteUuid: 'u1' },
  { uuid: '2', status: 'Entregue', data: '2026-03-02', total: 200, itens: [], clienteUuid: 'u1' },
  { uuid: '3', status: 'Cancelado', data: '2026-03-03', total: 300, itens: [], clienteUuid: 'u1' },
  { uuid: '4', status: 'Em Trânsito', data: '2026-03-04', total: 400, itens: [], clienteUuid: 'u1' },
];

describe('useFiltrosMeusPedidos (TDD)', () => {
  it('deve retornar todos os pedidos inicialmente', () => {
    const { result } = renderHook(() => useFiltrosMeusPedidos(PEDIDOS_MOCK));
    expect(result.current.pedidosFiltrados).toHaveLength(4);
    expect(result.current.abaAtiva).toBe('todos');
  });

  it('deve filtrar por pedidos em aberto (Pendentes, Aguardando Pagamento, Em Trânsito...)', () => {
    const { result } = renderHook(() => useFiltrosMeusPedidos(PEDIDOS_MOCK));
    
    act(() => {
      result.current.alterarAba('aberto');
    });

    expect(result.current.abaAtiva).toBe('aberto');
    // 'Aguardando Pagamento' e 'Em Trânsito' estão em aberto
    expect(result.current.pedidosFiltrados).toHaveLength(2);
    expect(result.current.pedidosFiltrados.every(p => ['Aguardando Pagamento', 'Em Trânsito'].includes(p.status))).toBe(true);
  });

  it('deve filtrar por pedidos finalizados (Entregue, Cancelado...)', () => {
    const { result } = renderHook(() => useFiltrosMeusPedidos(PEDIDOS_MOCK));
    
    act(() => {
      result.current.alterarAba('finalizados');
    });

    expect(result.current.abaAtiva).toBe('finalizados');
    // 'Entregue' e 'Cancelado' estão finalizados
    expect(result.current.pedidosFiltrados).toHaveLength(2);
    expect(result.current.pedidosFiltrados.every(p => ['Entregue', 'Cancelado'].includes(p.status))).toBe(true);
  });

  it('deve refinar a busca por um status específico (chip)', () => {
    const { result } = renderHook(() => useFiltrosMeusPedidos(PEDIDOS_MOCK));
    
    act(() => {
      result.current.alterarStatusFiltro('Em Trânsito');
    });

    expect(result.current.statusAtivo).toBe('Em Trânsito');
    expect(result.current.pedidosFiltrados).toHaveLength(1);
    expect(result.current.pedidosFiltrados[0].status).toBe('Em Trânsito');
  });

  it('deve limpar status ao trocar de aba (conforme comportamento do projeto)', () => {
    const { result } = renderHook(() => useFiltrosMeusPedidos(PEDIDOS_MOCK));
    
    act(() => {
      result.current.alterarStatusFiltro('Entregue');
      result.current.alterarAba('aberto');
    });

    expect(result.current.statusAtivo).toBe('');
    expect(result.current.pedidosFiltrados).toHaveLength(2); // Retorna aos 'abertos'
  });
});
