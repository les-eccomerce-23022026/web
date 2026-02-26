import { Link } from 'react-router-dom';
import { useListaLivrosAdmin } from '@/hooks/useLivros';
import styles from './ListaLivrosAdmin.module.css';
import { LoadingState } from '@/components/comum/LoadingState/LoadingState';
import { ErrorState } from '@/components/comum/ErrorState/ErrorState';
import { EmptyState } from '@/components/comum/EmptyState/EmptyState';

export function ListaLivrosAdmin() {
  const { livros, loading, error } = useListaLivrosAdmin();

  if (loading) return <LoadingState message="Buscando catálogo de livros..." />;
  if (error) return <ErrorState message="Não foi possível carregar a lista de livros." onRetry={() => window.location.reload()} />;

  return (
    <div className={`${styles['admin-page']} ${styles['lista-livros-admin']} page-transition-enter`}>
      <div className={styles['header-admin-list']}>
        <div className={styles['header-admin-title']}>
          <h2>Gestão de Catálogo (Livros)</h2>
          <p>Controle do acervo - Barnes & Noble System</p>
        </div>
        <Link to="/"><button className="btn-secondary">Sair do Painel (Loja)</button></Link>
      </div>

      <div className={styles['dashboard-grid-list']}>
        {/* Menu Lateral Admin (Mesmo padrão do Dashboard) */}
        <aside className={styles['sidebar-admin-list']}>
          <ul>
            <li className={styles['sidebar-group-title']}>Menu Principal</li>
            <li>
              <Link to="/admin" className={styles['sidebar-link']}>📊 Dashboard Analytics</Link>
            </li>
            <li className={styles['active-admin']}>
              <Link to="/admin/livros" className={`${styles['sidebar-link']} ${styles['active']}`}>📚 Gestão de Catálogo</Link>
            </li>
            <li>
              <Link to="/admin/estoque" className={styles['sidebar-link']}>📦 Controle de Estoque</Link>
            </li>
            <li className={styles['sidebar-group-title']}>Atendimento</li>
            <li>
              <Link to="/admin/trocas" className={styles['sidebar-link']}>🔄 Solicitações & Trocas</Link>
            </li>
            <li>
              <Link to="#/" className={`${styles['sidebar-link']} ${styles['disabled']}`}>👥 Gestão de Clientes</Link>
            </li>
          </ul>
        </aside>

        {/* Cópia Dashboard Conteúdo */}
        <div className={styles['content-admin-list']}>
          <div className={`card ${styles['list-card-wrapper']}`}>
            <div className={`toolbar ${styles['lista-livros-toolbar']}`}>
               <div className={styles['toolbar-search-wrapper']}>
                 <span className={styles['search-icon']}>🔍</span>
                 <input type="text" className={styles['lista-livros-search']} placeholder="Buscar por título, autor ou código de barras..." />
               </div>
               <div className={`filtros ${styles['lista-livros-filtros']}`}>
                 <select defaultValue="ativos" className={styles['filter-select']}>
                   <option value="ativos">Apenas Ativos</option>
                   <option value="inativos">Apenas Inativos</option>
                   <option value="todos">Todos</option>
                 </select>
                 <Link to="/admin/livros/novo"><button className={`btn-primary ${styles['btn-add-book']}`}>+ Novo Livro</button></Link>
               </div>
            </div>
            
            <div className="table-responsive">
              <table className={styles['lista-livros-table']}>
                <thead>
                  <tr className={styles['lista-livros-th-row']}>
                    <th className={styles['lista-livros-th']}>Cód. Produto</th>
                    <th className={styles['lista-livros-th']}>Título do Livro</th>
                    <th className={styles['lista-livros-th']}>Autor(es)</th>
                    <th className={styles['lista-livros-th']}>Categoria</th>
                    <th className={styles['lista-livros-th']}>Status</th>
                    <th className={styles['lista-livros-th']}>Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody>
                  {livros.map((livro) => (
                  <tr key={livro.uuid} className={styles['lista-livros-td-row']}>
                    <td className={styles['lista-livros-td']}>
                      <span className={styles['lista-livros-id-span']}>{livro.uuid.substring(0, 8)}...</span>
                    </td>
                    <td className={`${styles['lista-livros-td']} font-medium`}>{livro.titulo}</td>
                    <td className={`${styles['lista-livros-td']} text-muted`}>{livro.autor}</td>
                    <td className={styles['lista-livros-td']}>
                      <span className="category-badge">{livro.categoria}</span>
                    </td>
                    <td className={styles['lista-livros-td']}>
                      <span className={livro.status === 'Ativo' ? styles['lista-livros-status-active'] : styles['lista-livros-status-inactive']}>
                        {livro.status}
                      </span>
                    </td>
                    <td className={`${styles['lista-livros-td']} flex-actions`}>
                      <button className="btn-icon-admin edit" title="Editar informações">✏️</button>
                      <button className={`btn-icon-admin ${livro.status === 'Ativo' ? 'inactivate' : 'activate'}`} title={livro.status === 'Ativo' ? 'Inativar produto' : 'Ativar produto'}>
                         {livro.status === 'Ativo' ? '🛑' : '✅'}
                      </button>
                    </td>
                  </tr>
                  ))}
                  {livros.length === 0 && (
                    <tr className={styles['lista-livros-td-row']}>
                      <td colSpan={6} className="text-center p-0">
                        <EmptyState 
                          title="Nenhum resultado" 
                          message="Nenhum livro encontrado no catálogo."
                          icon="📚"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

