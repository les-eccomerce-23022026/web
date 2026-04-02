import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, User, LogOut, ShoppingCart, ShieldCheck, Package } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutSession } from "@/store/slices/authSlice";
import { setTermoBusca } from "@/store/slices/livroSlice";
import styles from "./Header.module.css";

export const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const carrinho = useAppSelector(state => state.carrinho.data);
  const termoStore = useAppSelector(state => state.livro.termoBusca);
  const [inputValue, setInputValue] = useState(termoStore);
  
  const quantidadeItens = carrinho?.itens.reduce((acc, item) => acc + item.quantidade, 0) || 0;
  const { isAuthenticated, user } = useAppSelector(state => state.auth);

  // Sincroniza o input com o store caso mude externamente (ex: limpando pesquisa)
  useEffect(() => {
    setInputValue(termoStore);
  }, [termoStore]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    dispatch(setTermoBusca(value));

    // Se estiver em outra página, vai para a home ao começar a buscar
    if (value && location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setTermoBusca(inputValue));
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <header className={styles['header-container']}>
      {/* Top Header - Verde Primário (full-width) */}
      <div className={styles['header-top']}>
        {/* Container interno centraliza o conteúdo com max-width */}
        <div className={`container ${styles['header-top-inner']}`}>
          <div className={styles['logo']}>
            <Link to="/">LES Livraria</Link>
          </div>

          <form className={styles['search-bar']} onSubmit={handleSearchSubmit}>
            <span className={styles['header-search-icon']}>
              <Search size={18} strokeWidth={2.5} />
            </span>
            <input
              type="text"
              placeholder="Buscar por título, autor ou sinopse..."
              value={inputValue}
              onChange={handleSearchChange}
            />
            <button type="submit" className={styles['search-btn']}>Buscar</button>
          </form>

          <div className={styles['header-actions']}>
            {isAuthenticated ? (
              <>
                <Link to="/perfil" className={styles['action-icon']} data-cy="header-user-profile" title={`Olá, ${user?.nome}`}>
                  <User size={22} strokeWidth={2} />
                </Link>
                <Link to="/pedidos" className={styles['action-icon']} data-cy="header-pedidos-link" title="Meus Pedidos">
                  <Package size={22} strokeWidth={2} />
                </Link>
                <button 
                  className={`${styles['action-icon']} ${styles['logout-btn']}`} 
                  type="button"
                  onClick={() => void dispatch(logoutSession())} 
                  data-cy="header-logout-button"
                  title="Sair"
                >
                  <LogOut size={22} strokeWidth={2} />
                </button>
              </>
            ) : (
              <Link to="/minha-conta" className={styles['action-icon']} data-cy="header-login-link" title="Minha Conta">
                <User size={22} strokeWidth={2} />
              </Link>
            )}
            
            <Link to="/carrinho" className={`${styles['action-icon']} ${styles['cart-container']}`} data-cy="header-cart-link" title="Carrinho">
              <ShoppingCart size={22} strokeWidth={2} />
              {quantidadeItens > 0 && (
                <span className={styles['cart-badge']}>{quantidadeItens}</span>
              )}
            </Link>

            {user?.role === 'admin' && (
              <Link to="/admin" className={`${styles['action-icon']} ${styles['admin-icon']}`} data-cy="header-admin-link" title="Administração">
                <ShieldCheck size={22} strokeWidth={2} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navegação Secundária - Categorias */}
      <nav className={styles['header-nav']}>
        <div className={`container ${styles['nav-links']}`}>
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
          <Link to="/mais-vendidos" className={styles['nav-link-highlight']}>🔥 Mais Vendidos</Link>
        </div>
      </nav>
    </header>
  );
}
