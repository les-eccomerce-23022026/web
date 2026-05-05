'use client';

import Link from 'next/link';
import { CapaLivro } from '@/components/Comum/CapaLivro/CapaLivro';
import { ControlesCompra } from '../ControlesCompra';
import type { ILivro } from '@/interfaces/livro';
import '@/pages-react-router/CadastroLivros/DetalhesLivro/style.module.css';

interface DetalhesLivroProps {
  livro: ILivro;
}

export const DetalhesLivro = ({ livro: data }: DetalhesLivroProps) => {
  if (!data) return <p className="detalhes-status-message">Livro não encontrado.</p>;

  return (
    <div className="detalhes-livro page-transition-enter">
      <div className="breadcrumb detalhes-breadcrumb">
        <span className="detalhes-breadcrumb-path">
          <Link href="/" className="breadcrumb-link">Início</Link>
          {data.categorias && data.categorias.length > 0 && data.categorias.map((cat: string, index: number) => (
            <span key={index}>
              {' > '}
              <Link
                href={`/categoria/${cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`}
                className="breadcrumb-link"
              >
                {cat}
              </Link>
            </span>
          ))}
          {' > '}
          <strong className="detalhes-breadcrumb-current">{data.titulo}</strong>
        </span>
      </div>

      <div className="detalhes-grid">
        <div className="coluna-imagem">
          <div className="imagem-destaque detalhes-imagem-destaque">
            <CapaLivro src={data.imagem} alt={data.titulo} titulo={data.titulo} className="detalhes-img" />
          </div>
        </div>

        <div className="coluna-info">
          <h1 className="detalhes-title">{data.titulo}</h1>
          <p className="detalhes-author">por <a href="#" className="detalhes-author-link">{data.autor}</a></p>

          <div className="rating detalhes-rating">
            {'★'.repeat(data.estrelas || 0)}{'☆'.repeat(5 - (data.estrelas || 0))} <span className="detalhes-rating-count">({data.numeroAvaliacoes || 0} avaliações)</span>
          </div>

          <div className="pricing detalhes-pricing">
            <h2 className="detalhes-price">R$ {data.preco.toFixed(2).replace('.', ',')}</h2>
            <ControlesCompra livro={data} variant="detalhes" />
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
};
