import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DetalhesLivro.css';
import { LivroService } from '@/services/LivroService';

export function DetalhesLivro() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    LivroService.getDetalhes('some-id').then(setData);
  }, []);

  if (!data) return <p style={{ padding: '20px' }}>Carregando detalhes do livro...</p>;

  return (
    <div className="detalhes-livro">
      <div className="breadcrumb detalhes-breadcrumb">
        <span className="detalhes-breadcrumb-path">Início &gt; {data.categorias.join(' > ')} &gt; <strong className="detalhes-breadcrumb-current">{data.titulo}</strong></span>
      </div>

      <div className="detalhes-grid">
        <div className="coluna-imagem">
          <div className="imagem-destaque detalhes-imagem-destaque">
            <img src={data.imagem} className="detalhes-img" alt="Livro" />
          </div>
        </div>
        
        <div className="coluna-info">
          <h1 className="detalhes-title">{data.titulo}</h1>
          <p className="detalhes-author">por <a href="#" className="detalhes-author-link">{data.autor}</a></p>
          
          <div className="rating detalhes-rating">
            {'★'.repeat(data.estrelas)}{'☆'.repeat(5-data.estrelas)} <span className="detalhes-rating-count">({data.numeroAvaliacoes} avaliações)</span>
          </div>

          <div className="pricing detalhes-pricing">
            <h2 className="detalhes-price">R$ {data.preco.toFixed(2).replace('.', ',')}</h2>
            <Link to="/carrinho"><button className="btn-primary detalhes-btn-add">Adicionar ao Carrinho</button></Link>
          </div>

          <div className="sinopse">
            <h3>Sinopse</h3>
            <hr className="detalhes-synopsis-divider" />
            <p className="detalhes-synopsis-text">{data.sinopse}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
