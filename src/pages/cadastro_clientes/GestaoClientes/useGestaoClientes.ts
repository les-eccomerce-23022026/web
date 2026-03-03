import { useState, useEffect } from 'react';
import clientesMock from '@/mocks/clientesMock.json';
import type { ICliente } from '@/interfaces/ICliente';

export function useGestaoClientes() {
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [clienteSelecionado, setClienteSelecionado] = useState<ICliente | null>(null);

  useEffect(() => {
    // RF0024 — consulta de clientes (admin)
    setTimeout(() => {
      setClientes(clientesMock.clientes as ICliente[]);
      setLoading(false);
    }, 300);
  }, []);

  const clientesFiltrados = clientes.filter((c) => {
    const busca = filtroBusca.toLowerCase();
    const matchBusca =
      !filtroBusca ||
      c.nome.toLowerCase().includes(busca) ||
      c.email.toLowerCase().includes(busca) ||
      c.cpf.replace(/\D/g, '').includes(busca.replace(/\D/g, ''));

    const matchAtivo =
      filtroAtivo === 'todos' ||
      (filtroAtivo === 'ativo' && c.ativo) ||
      (filtroAtivo === 'inativo' && !c.ativo);

    return matchBusca && matchAtivo;
  });

  return {
    clientesFiltrados,
    loading,
    filtroBusca,
    setFiltroBusca,
    filtroAtivo,
    setFiltroAtivo,
    clienteSelecionado,
    setClienteSelecionado,
    totalClientes: clientes.length,
    totalAtivos: clientes.filter((c) => c.ativo).length,
  };
}
