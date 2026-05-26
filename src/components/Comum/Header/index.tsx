'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, User, LogOut, ShoppingCart, ShieldCheck, Package, Bell } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutSession } from "@/store/slices/authSlice";
import { setTermoBusca } from "@/store/slices/livroSlice";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import styles from "./Header.module.css";
import { ROTAS } from "@/config/rotas";

export const Header = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const carrinho = useAppSelector(state => state.carrinho.data);
  const termoStore = useAppSelector(state => state.livro.termoBusca);
  const [inputValue, setInputValue] = useState(termoStore);
  const [quantidadeItens, setQuantidadeItens] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const categoriasMenu = useAppSelector((state) => state.livro.categoriasMenu);
  const { quantidadeNaoLidas } = useNotificacoes();

  // Marca quando o componente montou no cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sincroniza quantidade de itens do carrinho quando muda
  useEffect(() => {
    if (isMounted) {
      setQuantidadeItens(carrinho?.itens.reduce((acc, item) => acc + item.quantidade, 0) || 0);
    }
  }, [carrinho, isMounted]);

  // Sincroniza o input com o store caso mude externamente (ex: limpando pesquisa)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(termoStore);
  }, [termoStore]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    dispatch(setTermoBusca(value));

    // Se estiver em outra página, vai para a home ao começar a buscar
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
    <header className={styles['header-container']} suppressHydrationWarning>
      {/* Top Header - Verde Primário (full-width) */}
      <div className={styles['header-top']}>
        {/* Container interno centraliza o conteúdo com max-width */}
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
            {isAuthenticated ? (
              <>
                <Link href={ROTAS.MINHA_CONTA} className={styles['action-icon']} data-cy="header-user-profile" title={`Olá, ${user?.nome}`}>
                  <User size={22} strokeWidth={2} />
                </Link>
                <Link href={ROTAS.PEDIDOS} className={styles['action-icon']} data-cy="header-pedidos-link" title="Meus Pedidos">
                  <Package size={22} strokeWidth={2} />
                </Link>
                <Link href={ROTAS.NOTIFICACOES} className={`${styles['action-icon']} ${styles['notifications-container']}`} data-cy="header-notificacoes-link" title="Notificações">
                  <Bell size={22} strokeWidth={2} />
                  {quantidadeNaoLidas > 0 && (
                    <span className={styles['notification-badge']} suppressHydrationWarning>{quantidadeNaoLidas}</span>
                  )}
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
            
            <Link href={ROTAS.CARRINHO} className={`${styles['action-icon']} ${styles['cart-container']}`} data-cy="header-cart-link" title="Carrinho" suppressHydrationWarning>
              <ShoppingCart size={22} strokeWidth={2} />
              {isMounted && quantidadeItens > 0 && (
                <span className={styles['cart-badge']}>{quantidadeItens}</span>
              )}
            </Link>

            {/* Mostra ícone de admin apenas para admin_sistema ou admin */}
            {user?.papeis?.includes('admin_sistema') && (
              <Link href={ROTAS.ADMIN.HOME} className={`${styles['action-icon']} ${styles['admin-icon']}`} data-cy="header-admin-link" title="Administração do Sistema (acesso total)">
                <ShieldCheck size={22} strokeWidth={2} />
              </Link>
            )}
            {user?.papeis?.includes('admin') && !user?.papeis?.includes('admin_sistema') && (
              <Link href={ROTAS.ADMIN.HOME} className={`${styles['action-icon']} ${styles['admin-icon']}`} data-cy="header-admin-link" title="Administração da Loja (acesso restrito)">
                <ShieldCheck size={22} strokeWidth={2} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navegação Secundária - Categorias */}
      <nav className={styles['header-nav']}>
        <div className={`container ${styles['nav-links']}`}>
          {categoriasMenu.map((c) => (
            <Link key={c.slug} href={ROTAS.CATEGORIA(c.slug)} className={styles['nav-link-with-count']}>
              {c.nome}
              <span className={styles['category-count']}>{c.contadorProdutos}</span>
            </Link>
          ))}
          <Link href={ROTAS.MAIS_VENDIDOS} className={styles['header-link']}>
            Mais vendidos
          </Link>
        </div>
      </nav>
    </header>
  );
}
