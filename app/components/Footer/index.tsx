'use client';

import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import '@/components/Comum/Footer/Footer.css';
import { ROTAS } from '@/config/rotas';

export const Footer = () => {
  const categoriasMenu = useAppSelector((state) => state.livro.categoriasMenu);

  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-column">
          <h3>LES Books</h3>
          <p>A sua livraria online favorita. Encontre os melhores títulos de ficção, não-ficção e muito mais, com a comodidade de receber em casa.</p>
        </div>

        <div className="footer-column">
          <h3>Navegação</h3>
          <ul>
            <li><Link href={ROTAS.HOME}>Início</Link></li>
            <li><Link href={ROTAS.MAIS_VENDIDOS}>Mais Vendidos</Link></li>
            {categoriasMenu.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={ROTAS.CATEGORIA(c.slug)}>{c.nome}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-column">
          <h3>Minha Conta</h3>
          <ul>
            <li><Link href={ROTAS.MINHA_CONTA}>Meus Dados</Link></li>
            <li><Link href={ROTAS.PEDIDOS}>Meus Pedidos</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Suporte</h3>
          <ul>
            <li><Link href={ROTAS.MINHA_CONTA}>Fale Conosco</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© 2026 LES Books — Laboratório de Engenharia de Software. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
