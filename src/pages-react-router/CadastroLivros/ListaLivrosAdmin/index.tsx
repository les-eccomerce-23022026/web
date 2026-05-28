'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useListaLivrosAdmin } from '../../../hooks/useLivros';
import { useAppDispatch } from '../../../store/hooks';
import { fetchLivrosAdmin } from '../../../store/slices/livroSlice';
import styles from './style.module.css';
import { AdminKPIs } from '../../../components/Admin/AdminKPIs';
import { AdminToolbar } from '../../../components/Admin/AdminToolbar';
import { AdminTable } from '../../../components/Admin/AdminTable';
import { livroPassaFiltrosLista } from './listaLivrosFiltros';
import { ModalJustificativaStatus } from './ModalJustificativaStatus';
import { obterKPIsLivros } from './kpisLivros';
import { obterColunasTabelaLivros } from './tabelaColunas';
import { calcularPaginacao } from './paginacaoHelper';
import { useModalJustificativa } from './useModalJustificativa';
import { ROTAS } from '@/config/rotas';

function ListaLivrosAdmin() {
  const { livros, loading, error } = useListaLivrosAdmin();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [paginaAtual, setPaginaAtual] = useState(1);
  
  const modal = useModalJustificativa();

  useEffect(() => {
    dispatch(fetchLivrosAdmin());
  }, [dispatch]);

  const filteredLivros = livros.filter((livro) =>
    livroPassaFiltrosLista(livro, searchTerm, statusFilter),
  );

  const { totalPaginas, dadosPaginados: livrosPaginados } = calcularPaginacao(filteredLivros, paginaAtual);

  useEffect(() => {
    setPaginaAtual(1);
  }, [searchTerm, statusFilter]);

  const kpis = obterKPIsLivros(livros);
  const colunas = obterColunasTabelaLivros(
    (uuid) => router.push(`/admin/livros/${uuid}/editar`),
    modal.solicitarTrocaStatus,
  );

  if (loading) return <div className={styles.pageContent}>Carregando...</div>;
  if (error) return <div className={styles.pageContent}>Erro: {String(error)}</div>;

  return (
    <div className={styles.pageContent}>
      <div className={`card ${styles.listCardWrapper}`}>
        <AdminKPIs kpis={kpis} columns={4} enableCarousel={true} />
        
        <AdminToolbar
          placeholderBusca="Buscar por título, autor ou sinopse..."
          onBusca={setSearchTerm}
          filtros={[
            {
              id: 'status',
              label: 'Status',
              value: statusFilter,
              opcoes: [
                { label: 'Todos os Livros', value: 'todos' },
                { label: 'Apenas Ativos', value: 'ativos' },
                { label: 'Apenas Inativos', value: 'inativos' },
              ],
            },
          ]}
          onFiltroChange={(id, valor) => {
            if (id === 'status') setStatusFilter(valor as 'todos' | 'ativos' | 'inativos');
          }}
          acoes={[
            {
              label: '+ Novo Livro',
              onClick: () => router.push(ROTAS.ADMIN.LIVRO_NOVO),
              variante: 'primario',
            },
          ]}
        />

        <AdminTable
          colunas={colunas}
          dados={livrosPaginados}
          rowKey="uuid"
          carregando={false}
          estadoVazio={{
            titulo: 'Nenhum resultado',
            mensagem: 'Nenhum livro encontrado com esses filtros.',
            icone: '📚',
          }}
          paginacao={{
            paginaAtual,
            totalPaginas,
            aoMudarPagina: setPaginaAtual,
          }}
        />
      </div>

      <ModalJustificativaStatus
        isOpen={modal.modalOpen}
        onClose={modal.fecharModal}
        onConfirm={modal.confirmarTrocaStatus}
        justificativaTexto={modal.justificativaTexto}
        setJustificativaTexto={modal.setJustificativaTexto}
        justificativaCategoria={modal.justificativaCategoria}
        setJustificativaCategoria={modal.setJustificativaCategoria}
        erroModal={modal.erroModal}
      />
    </div>
  );
}

export default ListaLivrosAdmin;
export { ListaLivrosAdmin };
