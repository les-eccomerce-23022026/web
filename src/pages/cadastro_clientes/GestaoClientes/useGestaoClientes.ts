import { useState, useEffect } from 'react';
import { AdminClienteService } from '@/services/AdminClienteService';
import type { IClienteAdminItem } from '@/services/contracts/IAdminClienteService';
import { clientePassaFiltros } from './gestaoClientesFiltro';

export function useGestaoClientes() {
  const [clientes, setClientes] = useState<IClienteAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [clienteSelecionado, setClienteSelecionado] = useState<IClienteAdminItem | null>(null);

  useEffect(() => {
    async function carregarClientes() {
      try {
        setLoading(true);
        // Por enquanto buscamos uma lista grande para o filtro em memória, 
        // ou poderíamos integrar a busca na API conforme o usuário digita.
        const resultado = await AdminClienteService.listarClientes({ limite: 1000 });
        setClientes(resultado.clientes);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarClientes();
  }, []);

  const clientesFiltrados = clientes.filter((c) =>
    clientePassaFiltros(c, filtroBusca, filtroAtivo),
  );

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
