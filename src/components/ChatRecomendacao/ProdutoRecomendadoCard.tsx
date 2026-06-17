'use client';

import { BookOpen, Star } from 'lucide-react';
import type { IProdutoRecomendado } from '@/interfaces/iaRecomendacao';
import styles from './ProdutoRecomendadoCard.module.css';

interface ProdutoRecomendadoCardProps {
  produto: IProdutoRecomendado;
}

export const ProdutoRecomendadoCard = ({ produto }: ProdutoRecomendadoCardProps) => {
  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco);
  };

  const formatarSimilaridade = (similaridade: number) => {
    return Math.round(similaridade * 100);
  };

  return (
    <article className={styles.card} data-cy="ia-produto-card">
      <div className={styles.cardHeader}>
        <BookOpen size={14} className={styles.icon} aria-hidden />
        <h3 className={styles.titulo} data-cy="ia-produto-titulo" title={produto.titulo}>
          {produto.titulo}
        </h3>
      </div>

      <div className={styles.cardBody}>
        <p className={styles.autor} data-cy="ia-produto-autor" title={produto.autor}>
          {produto.autor}
        </p>
        <div className={styles.metaLinha}>
          <span className={styles.categoria} data-cy="ia-produto-categoria">
            {produto.categoria}
          </span>
          {produto.similaridade > 0 && (
            <span className={styles.similaridadeBadge} data-cy="ia-produto-similaridade">
              <Star size={10} className={styles.starIcon} aria-hidden />
              {formatarSimilaridade(produto.similaridade)}%
            </span>
          )}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.preco} data-cy="ia-produto-preco">
          {formatarPreco(produto.preco)}
        </span>
        <a
          href={`/livro/${produto.uuid}`}
          className={styles.link}
          data-cy="ia-produto-link"
        >
          Ver detalhes
        </a>
      </div>
    </article>
  );
};
