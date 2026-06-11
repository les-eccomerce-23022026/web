'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, User, LogOut, ShoppingCart, ShieldCheck, Package } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutSession } from '@/store/slices/authSlice';
import { setTermoBusca } from '@/store/slices/livroSlice';
import styles from '@/components/Comum/Header/style.module.css';
import { ROTAS } from '@/config/rotas';

export const Header = () => {
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  // Evita hydration mismatch: SSR e 1ª pintura do cliente usam UI de visitante
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const carrinho = useAppSelector((state) => state.carrinho.data);
  const termoStore = useAppSelector((state) => state.livro.termoBusca);
  const [inputValue, setInputValue] = useState(termoStore);

  const quantidadeItens = carrinho?.itens.reduce((acc, item) => acc + item.quantidade, 0) || 0;
  const { isAuthenticated, user, sessionLoading } = useAppSelector((state) => state.auth);
  const categoriasMenu = useAppSelector((state) => state.livro.categoriasMenu);
  const exibirAutenticado = mounted && isAuthenticated;

  // Debug hydration mismatch
  useEffect(() => {
    console.log('[Header] Renderizado');
    console.log('[Header] isAuthenticated:', isAuthenticated);
    console.log('[Header] user:', user);
    console.log('[Header] sessionLoading:', sessionLoading);
    console.log('[Header] pathname:', pathname);
  }, [isAuthenticated, user, sessionLoading, pathname]);

  // Sincroniza o input com o store caso mude externamente (ex: limpando pesquisa)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(termoStore);
  }, [termoStore]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    dispatch(setTermoBusca(value));

    if (value && pathname !== ROTAS.HOME) {
      router.push(ROTAS.HOME);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setTermoBusca(inputValue));
    if (pathname !== ROTAS.HOME) {
      router.push(ROTAS.HOME);
    }
  };

  return (
    <header className={styles['header-container']}>
      <div className={styles['header-top']}>
        <div className={`container ${styles['header-top-inner']}`}>
          <div className={styles['logo']}>
            <Link href={ROTAS.HOME}>LES Livraria</Link>
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
            {exibirAutenticado ? (
              <>
                <Link href={ROTAS.MINHA_CONTA} className={styles['action-icon']} data-cy="header-user-profile" title={`Olá, ${user?.nome}`}>
                  <User size={22} strokeWidth={2} />
                </Link>
                <Link href={ROTAS.PEDIDOS} className={styles['action-icon']} data-cy="header-pedidos-link" title="Meus Pedidos">
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
              <Link href={ROTAS.MINHA_CONTA} className={styles['action-icon']} data-cy="header-login-link" title="Minha Conta">
                <User size={22} strokeWidth={2} />
              </Link>
            )}

            <Link href={ROTAS.CARRINHO} className={`${styles['action-icon']} ${styles['cart-container']}`} data-cy="header-cart-link" title="Carrinho">
              <ShoppingCart size={22} strokeWidth={2} />
              {mounted && quantidadeItens > 0 && (
                <span className={styles['cart-badge']} data-cy="header-cart-badge">{quantidadeItens}</span>
              )}
            </Link>

            {mounted && user?.role === 'admin' && (
              <Link href={ROTAS.ADMIN.HOME} className={`${styles['action-icon']} ${styles['admin-icon']}`} data-cy="header-admin-link" title="Administração">
                <ShieldCheck size={22} strokeWidth={2} />
              </Link>
            )}
          </div>
        </div>
      </div>

      <nav className={styles['header-nav']}>
        <div className={`container ${styles['nav-links']}`}>
          {categoriasMenu.map((c) => (
            <Link key={c.slug} href={ROTAS.CATEGORIA(c.slug)}>
              {c.nome}
            </Link>
          ))}
          <Link href={ROTAS.MAIS_VENDIDOS} className={styles['nav-link-highlight']}>
            🔥 Mais Vendidos
          </Link>
        </div>
      </nav>
    </header>
  );
};
