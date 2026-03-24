import { useState, useEffect } from 'react';
import { AdminClienteService } from '@/services/AdminClienteService';
import type { IClienteAdminItem } from '@/services/contracts/IAdminClienteService';

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
