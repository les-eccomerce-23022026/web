import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useListaLivrosAdmin } from '@/hooks/useLivros';
import { useAppDispatch } from '@/store/hooks';
import { alternarStatusLivro, fetchLivrosAdmin } from '@/store/slices/livroSlice';
import styles from './ListaLivrosAdmin.module.css';
import { LoadingState } from '@/components/comum/LoadingState/LoadingState';
import { ErrorState } from '@/components/comum/ErrorState/ErrorState';
import { EmptyState } from '@/components/comum/EmptyState/EmptyState';
import { Modal } from '@/components/comum/Modal';

export function ListaLivrosAdmin() {
  const { livros, loading, error } = useListaLivrosAdmin();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchLivrosAdmin());
  }, [dispatch]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  
  // RN0015-RN0017 - Modal de Justificativa
  const [modalOpen, setModalOpen] = useState(false);
  const [livroPendenteStatus, setLivroPendenteStatus] = useState<string | null>(null);
  const [justificativaTexto, setJustificativaTexto] = useState('');
  const [justificativaCategoria, setJustificativaCategoria] = useState('');

  if (loading) return <LoadingState message="Buscando catálogo de livros..." />;
  if (error) return <ErrorState message="Não foi possível carregar a lista de livros." onRetry={() => window.location.reload()} />;

  const solicitarTrocaStatus = (uuid: string) => {
    setLivroPendenteStatus(uuid);
    setJustificativaTexto('');
    setJustificativaCategoria('');
    setModalOpen(true);
  };

  const confirmarTrocaStatus = () => {
    if (!justificativaTexto || !justificativaCategoria) {
      alert("Para prosseguir preencha a categoria e justifique a mudança.");
      return;
    }
    
    if (livroPendenteStatus) {
      dispatch(alternarStatusLivro({ 
        uuid: livroPendenteStatus, 
        justificativa: justificativaTexto, 
        categoriaInativacao: justificativaCategoria 
      }));
    }
    setModalOpen(false);
    setLivroPendenteStatus(null);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setLivroPendenteStatus(null);
  };

  const filteredLivros = livros.filter(livro => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      livro.titulo.toLowerCase().includes(term) ||
      livro.autor.toLowerCase().includes(term) ||
      livro.isbn.toLowerCase().includes(term) ||
      livro.sinopse?.toLowerCase().includes(term);

    const matchesStatus = 
      statusFilter === 'todos' ||
      (statusFilter === 'ativos' && livro.status === 'Ativo') ||
      (statusFilter === 'inativos' && livro.status === 'Inativo');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.pageContent}>
      <div className={`card ${styles.listCardWrapper}`}>
        <div className={`toolbar ${styles.listaLivrosToolbar}`}>
          <div className={styles.toolbarSearchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.listaLivrosSearch}
              placeholder="Buscar por título, autor ou sinopse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={`filtros ${styles.listaLivrosFiltros}`}>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as 'todos' | 'ativos' | 'inativos')}
              className={styles.filterSelect}
            >
              <option value="todos">Todos os Livros</option>
              <option value="ativos">Apenas Ativos</option>
              <option value="inativos">Apenas Inativos</option>
            </select>
            <Link to="/admin/livros/novo">
              <button className={`btn-primary ${styles.btnAddBook}`}>+ Novo Livro</button>
            </Link>
          </div>
        </div>

        <div className="table-responsive">
          <table className={styles.listaLivrosTable}>
            <thead>
              <tr className={styles.listaLivrosThRow}>
                <th className={styles.listaLivrosTh}>Título e Autor</th>
                <th className={styles.listaLivrosTh}>ISBN</th>
                <th className={styles.listaLivrosTh}>Estoque</th>
                <th className={styles.listaLivrosTh}>Status</th>
                <th className={styles.listaLivrosTh}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLivros.map((livro) => (
                <tr key={livro.uuid} className={styles.listaLivrosTdRow}>
                  <td className={styles.listaLivrosTd}>
                     <div className={styles.livroInfoCell}>
                        <strong>{livro.titulo}</strong>
                        <span>{livro.autor}</span>
                     </div>
                  </td>
                  <td className={styles.listaLivrosTd}>{livro.isbn}</td>
                  <td className={styles.listaLivrosTd}>
                    <span className={livro.estoque <= 5 ? styles.estoqueBadgeCritico : styles.estoqueBadge}>
                      {livro.estoque} un
                    </span>
                  </td>
                  <td className={styles.listaLivrosTd}>
                    <span className={livro.status === 'Ativo' ? styles.listaLivrosStatusActive : styles.listaLivrosStatusInactive}>
                      {livro.status}
                    </span>
                  </td>
                  <td className={`${styles.listaLivrosTd} ${styles.flexActions}`}>
                    <button className={`${styles.btnActionAdmin} ${styles.edit}`} title="Editar informações">Editar</button>
                    <button
                      onClick={() => solicitarTrocaStatus(livro.uuid)}
                      className={`${styles.btnActionAdmin} ${livro.status === 'Ativo' ? styles.inactivate : styles.activate}`}
                    >
                      {livro.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLivros.length === 0 && (
                <tr className={styles.listaLivrosTdRow}>
                  <td colSpan={5} className={styles.textCenter}>
                    <EmptyState
                      title="Nenhum resultado"
                      message="Nenhum livro encontrado com esses filtros."
                      icon="📚"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={fecharModal} 
        title="Justificar Alteração de Status"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Categoria da Ação *</label>
            <select 
              value={justificativaCategoria}
              onChange={(e) => setJustificativaCategoria(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">Selecione...</option>
              <option value="Fora de Mercado">Fora de Mercado</option>
              <option value="Reedição">Reedição Prevista</option>
              <option value="Avariado">Lote Avariado</option>
              <option value="Novo Lote">Fim de Indisponibilidade/Novo Lote</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Justificativa Descritiva *</label>
            <textarea 
              rows={4}
              value={justificativaTexto}
              onChange={(e) => setJustificativaTexto(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Descreva o motivo detalhado..."
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button 
              onClick={fecharModal} 
              style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button 
              onClick={confirmarTrocaStatus}
              style={{ padding: '8px 16px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Confirmar Alteração
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
