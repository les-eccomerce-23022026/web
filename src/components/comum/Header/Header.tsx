import { Link } from "react-router-dom";
import "./Header.css";

export function Header() {
  return (
    <header className="header-container">
      {/* Top Header - Verde Primário (full-width) */}
      <div className="header-top">
        {/* Container interno centraliza o conteúdo com max-width */}
        <div className="container header-top-inner">
          <div className="logo">
            <Link to="/">LES Livraria</Link>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar por título, autor ou ISBN..."
            />
            <button className="search-btn">🔍</button>
          </div>

          <div className="header-actions">
            <Link to="/minha-conta" className="action-link">
              👤 Minha Conta
            </Link>
            <Link to="/carrinho" className="action-link">
              🛒 Carrinho (0)
            </Link>
            <Link to="/admin" className="action-link admin-link">
              ⚙️ Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Navegação Secundária - Categorias */}
      <nav className="header-nav">
        <div className="container nav-links">
          <Link to="/categoria/ficcao">Ficção</Link>
          <Link to="/categoria/nao-ficcao">Não-Ficção</Link>
          <Link to="/categoria/romance">Romance</Link>
          <Link to="/categoria/fantasia">Fantasia</Link>
          <Link to="/categoria/suspense">Suspense</Link>
          <Link to="/categoria/terror">Terror</Link>
          <Link to="/categoria/biografias">Biografias</Link>
          <Link to="/categoria/autoajuda">Autoajuda</Link>
          <Link to="/categoria/tecnico">Técnico e Científico</Link>
          <Link to="/categoria/infantil">Infantil</Link>
          <Link to="/mais-vendidos" className="nav-link-highlight">🔥 Mais Vendidos</Link>
        </div>
      </nav>
    </header>
  );
}
