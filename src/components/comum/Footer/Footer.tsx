import { Link } from 'react-router-dom';
import './Footer.css';

export function Footer() {
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
            <li><Link to="/">Início</Link></li>
            <li><Link to="/mais-vendidos">Mais Vendidos</Link></li>
            <li><Link to="/categoria/ficcao">Ficção</Link></li>
            <li><Link to="/categoria/nao-ficcao">Não-Ficção</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Minha Conta</h3>
          <ul>
            <li><Link to="/minha-conta">Meus Dados</Link></li>
            <li><Link to="/meus-pedidos">Meus Pedidos</Link></li>
            <li><Link to="/enderecos">Endereços</Link></li>
            <li><Link to="/cartoes">Cartões</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Suporte</h3>
          <ul>
            <li><Link to="/central-ajuda">Central de Ajuda</Link></li>
            <li><Link to="/politica-trocas">Política de Trocas</Link></li>
            <li><Link to="/fale-conosco">Fale Conosco</Link></li>
            <li><Link to="/termos-uso">Termos de Uso</Link></li>
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
}
