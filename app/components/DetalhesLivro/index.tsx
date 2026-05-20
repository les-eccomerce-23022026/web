'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CapaLivro } from '@/components/Comum/CapaLivro/CapaLivro';
import { ControlesCompra } from '../ControlesCompra';
import type { ILivro } from '@/interfaces/livro';
import { LivroServiceApi } from '@/services/api/livroServiceApi';
import '@/pages-react-router/CadastroLivros/DetalhesLivro/style.module.css';

interface DetalhesLivroProps {
  livro?: ILivro;
  livroUuid?: string;
}

const livroService = new LivroServiceApi();

export const DetalhesLivro = ({ livro: data, livroUuid }: DetalhesLivroProps) => {
  const [livro, setLivro] = useState<ILivro | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  // Se recebeu livroUuid mas não livro, faz o fetch no client-side via ApiClient
  // O ApiClient centralizado envia automaticamente x-use-test-db, cookies HttpOnly e token
  useEffect(() => {
    if (livroUuid && !data) {
      setLoading(true);
      setError(null);

      livroService.getDetalhes(livroUuid)
        .then(livroData => {
          setLivro(livroData);
          setLoading(false);
        })
        .catch(erro => {
          console.error('[DetalhesLivro] Erro ao buscar livro:', erro);
          setError('Erro ao carregar livro');
          setLoading(false);
        });
    }
  }, [livroUuid, data]);

  if (loading) return <p className="detalhes-status-message">Carregando...</p>;
  if (error) return <p className="detalhes-status-message">{error}</p>;
  if (!livro) return <p className="detalhes-status-message">Livro não encontrado.</p>;

  return (
    <div className="detalhes-livro page-transition-enter">
      <div className="breadcrumb detalhes-breadcrumb">
        <span className="detalhes-breadcrumb-path">
          <Link href="/" className="breadcrumb-link">Início</Link>
          {livro.categorias && livro.categorias.length > 0 && livro.categorias.map((cat: string, index: number) => (
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
          <strong className="detalhes-breadcrumb-current">{livro.titulo}</strong>
        </span>
      </div>

      <div className="detalhes-grid">
        <div className="coluna-imagem">
          <div className="imagem-destaque detalhes-imagem-destaque">
            <CapaLivro src={livro.imagem} alt={livro.titulo} titulo={livro.titulo} className="detalhes-img" />
          </div>
        </div>

        <div className="coluna-info">
          <h1 className="detalhes-title">{livro.titulo}</h1>
          <p className="detalhes-author">por <a href="#" className="detalhes-author-link">{livro.autor}</a></p>

          <div className="rating detalhes-rating">
            {'★'.repeat(livro.estrelas || 0)}{'☆'.repeat(5 - (livro.estrelas || 0))} <span className="detalhes-rating-count">({livro.numeroAvaliacoes || 0} avaliações)</span>
          </div>

          <div className="pricing detalhes-pricing">
            <h2 className="detalhes-price">R$ {Number(livro.preco).toFixed(2).replace('.', ',')}</h2>
            <ControlesCompra livro={livro} variant="detalhes" />
          </div>

          <div className="sinopse">
            <h3>Sinopse</h3>
            <hr className="detalhes-synopsis-divider" />
            <p className="detalhes-synopsis-text">{livro.sinopse}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
