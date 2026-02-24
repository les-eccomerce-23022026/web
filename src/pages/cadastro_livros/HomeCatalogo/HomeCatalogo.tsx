import { useState, useEffect } from 'react';
import './HomeCatalogo.css';
import { LivroService } from '@/services/LivroService';

export function HomeCatalogo() {
  const [destaques, setDestaques] = useState<any[]>([]);

  useEffect(() => {
    LivroService.getDestaques().then(setDestaques);
  }, []);

  return (
    <div className="home-catalogo">
      <div className="pagina-inicio__banner">
        <h2 className="pagina-inicio__banner-titulo">Ofertas de Inverno - Até 50% em Ficção</h2>
      </div>
      
      <h3>Lançamentos Destacados</h3>
      <div className="grade grade--produto">
        {destaques.map((book: any) => (
          <div key={book.uuid} className="cartao-livro">
            <div className="cartao-livro__capa-container">
              <img src={book.imagem} alt="Capa" className="cartao-livro__capa" />
            </div>
            <div className="cartao-livro__info">
              <h4 className="cartao-livro__titulo">{book.titulo}</h4>
              <p className="cartao-livro__autor">{book.autor}</p>
              <div className="cartao-livro__avaliacao">{'★'.repeat(book.estrelas)}{'☆'.repeat(5-book.estrelas)}</div>
              <div className="cartao-livro__preco-container">
                 <p className="cartao-livro__preco">R$ {book.preco.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
            <div className="cartao-livro__acao">
               <a href={`/livro/${book.uuid}`} className="botao btn-secondary">Ver Detalhes</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
