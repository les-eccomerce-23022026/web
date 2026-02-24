import { Link } from 'react-router-dom';
import { useListaLivrosAdmin } from '@/hooks/useLivros';
import './ListaLivrosAdmin.css';
import { LoadingState } from '@/components/comum/LoadingState/LoadingState';
import { ErrorState } from '@/components/comum/ErrorState/ErrorState';
import { EmptyState } from '@/components/comum/EmptyState/EmptyState';

export function ListaLivrosAdmin() {
  const { livros, loading, error } = useListaLivrosAdmin();

  if (loading) return <LoadingState message="Buscando catálogo de livros..." />;
  if (error) return <ErrorState message="Não foi possível carregar a lista de livros." onRetry={() => window.location.reload()} />;

  return (
    <div className="admin-page lista-livros-admin page-transition-enter">
      <div className="header-admin-list">
        <div className="header-admin-title">
          <h2>Gestão de Catálogo (Livros)</h2>
          <p>Controle do acervo - Barnes & Noble System</p>
        </div>
        <Link to="/"><button className="btn-secondary">Sair do Painel (Loja)</button></Link>
      </div>

      <div className="dashboard-grid-list">
        {/* Menu Lateral Admin (Mesmo padrão do Dashboard) */}
        <aside className="sidebar-admin-list">
          <ul>
            <li className="sidebar-group-title">Menu Principal</li>
            <li>
              <Link to="/admin" className="sidebar-link">📊 Dashboard Analytics</Link>
            </li>
            <li className="active-admin">
              <Link to="/admin/livros" className="sidebar-link active">📚 Gestão de Catálogo</Link>
            </li>
            <li>
              <Link to="/admin/estoque" className="sidebar-link">📦 Controle de Estoque</Link>
            </li>
            <li className="sidebar-group-title">Atendimento</li>
            <li>
              <Link to="/admin/trocas" className="sidebar-link">🔄 Solicitações & Trocas</Link>
            </li>
            <li>
              <Link to="#/" className="sidebar-link disabled">👥 Gestão de Clientes</Link>
            </li>
          </ul>
        </aside>

        {/* Cópia Dashboard Conteúdo */}
        <div className="content-admin-list">
          <div className="card list-card-wrapper">
            <div className="toolbar lista-livros-toolbar">
               <div className="toolbar-search-wrapper">
                 <span className="search-icon">🔍</span>
                 <input type="text" className="lista-livros-search" placeholder="Buscar por título, autor ou código de barras..." />
               </div>
               <div className="filtros lista-livros-filtros">
                 <select defaultValue="ativos" className="filter-select">
                   <option value="ativos">Apenas Ativos</option>
                   <option value="inativos">Apenas Inativos</option>
                   <option value="todos">Todos</option>
                 </select>
                 <Link to="/admin/livros/novo"><button className="btn-primary btn-add-book">+ Novo Livro</button></Link>
               </div>
            </div>
            
            <div className="table-responsive">
              <table className="lista-livros-table">
                <thead>
                  <tr className="lista-livros-th-row">
                    <th className="lista-livros-th">Cód. Produto</th>
                    <th className="lista-livros-th">Título do Livro</th>
                    <th className="lista-livros-th">Autor(es)</th>
                    <th className="lista-livros-th">Categoria</th>
                    <th className="lista-livros-th">Status</th>
                    <th className="lista-livros-th text-center">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody>
                  {livros.map((livro) => (
                  <tr key={livro.uuid} className="lista-livros-td-row">
                    <td className="lista-livros-td">
                      <span className="lista-livros-id-span">{livro.uuid.substring(0, 8)}...</span>
                    </td>
                    <td className="lista-livros-td font-medium">{livro.titulo}</td>
                    <td className="lista-livros-td text-muted">{livro.autor}</td>
                    <td className="lista-livros-td">
                      <span className="category-badge">{livro.categoria}</span>
                    </td>
                    <td className="lista-livros-td">
                      <span className={livro.status === 'Ativo' ? 'lista-livros-status-active' : 'lista-livros-status-inactive'}>
                        {livro.status}
                      </span>
                    </td>
                    <td className="lista-livros-td flex-actions">
                      <button className="btn-icon-admin edit" title="Editar informações">✏️</button>
                      <button className={`btn-icon-admin ${livro.status === 'Ativo' ? 'inactivate' : 'activate'}`} title={livro.status === 'Ativo' ? 'Inativar produto' : 'Ativar produto'}>
                         {livro.status === 'Ativo' ? '🛑' : '✅'}
                      </button>
                    </td>
                  </tr>
                  ))}
                  {livros.length === 0 && (
                    <tr className="lista-livros-td-row">
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

