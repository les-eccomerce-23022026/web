'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CapaLivro } from '@/components/Comum/CapaLivro/CapaLivro';
import { ControlesCompra } from '../ControlesCompra';
import type { ILivro } from '@/interfaces/livro';
import { LivroServiceApi } from '@/services/api/livroServiceApi';
import { Book, Tag } from 'lucide-react';
import { ROTAS } from '@/config/rotas';
import styles from './DetalhesLivro.module.css';

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

  if (loading) return <p className={styles.statusMessage}>Carregando...</p>;
  if (error) return <p className={styles.statusMessage}>{error}</p>;
  if (!livro) return <p className={styles.statusMessage}>Livro não encontrado.</p>;

  const categoriaPrincipal = livro.categorias?.[0] || 'Geral';

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <div className={styles.breadcrumbPath}>
          <Link href={ROTAS.HOME} className={styles.breadcrumbLink}>Início</Link>
          <span>›</span>
          <Link
            href={ROTAS.CATEGORIA(categoriaPrincipal.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-'))}
            className={styles.breadcrumbLink}
          >
            {categoriaPrincipal}
          </Link>
          <span>›</span>
          <strong className={styles.breadcrumbCurrent}>{livro.titulo}</strong>
        </div>
      </nav>

      {/* Grid layout - responsivo */}
      <div className={styles.gridContainer}>
        {/* Coluna da imagem */}
        <div className={styles.imageColumn}>
          <div className={styles.imageContainer}>
            {livro.imagem ? (
              <CapaLivro src={livro.imagem} alt={livro.titulo} titulo={livro.titulo} className={styles.bookCover} />
            ) : (
              <div className={styles.bookCoverPlaceholder}>
                <Book size={48} />
                <span>Sem capa</span>
              </div>
            )}
          </div>
        </div>

        {/* Coluna de informações */}
        <div className={styles.infoColumn}>
          {/* Cabeçalho */}
          <div>
            <h1 className={styles.title}>{livro.titulo}</h1>
            <p className={styles.author}>por <a href="#" className={styles.authorLink}>{livro.autor}</a></p>
          </div>

          {/* Avaliação */}
          <div className={styles.rating}>
            {'★'.repeat(livro.estrelas || 0)}{'☆'.repeat(5 - (livro.estrelas || 0))} <span className={styles.ratingCount}>({livro.numeroAvaliacoes || 0} avaliações)</span>
          </div>

          {/* Badges */}
          <div className={styles.badgesContainer}>
            {livro.categorias && livro.categorias.length > 0 && (
              <div className={styles.badge}>
                <Tag size={14} className={styles.badgeIcon} />
                <span>{livro.categorias[0]}</span>
              </div>
            )}
            {livro.isbn && (
              <div className={styles.badge}>
                <Book size={14} className={styles.badgeIcon} />
                <span>ISBN: {livro.isbn}</span>
              </div>
            )}
          </div>

          {/* Preço e compra */}
          <div className={styles.pricing}>
            <h2 className={styles.price}>R$ {Number(livro.preco).toFixed(2).replace('.', ',')}</h2>
            <ControlesCompra livro={livro} variant="detalhes" />
          </div>

          {/* Sinopse */}
          <div className={styles.synopsis}>
            <h3 className={styles.synopsisTitle}>Sinopse</h3>
            <hr className={styles.synopsisDivider} />
            <p className={styles.synopsisText}>{livro.sinopse}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
