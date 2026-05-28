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
    <div
      className={styles.card}
      data-cy="ia-produto-card"
    >
      <div className={styles.cardHeader}>
        <div className={styles.tituloContainer}>
          <BookOpen size={16} className={styles.icon} />
          <h3 className={styles.titulo} data-cy="ia-produto-titulo">
            {produto.titulo}
          </h3>
        </div>
        {produto.similaridade > 0 && (
          <div className={styles.similaridadeBadge} data-cy="ia-produto-similaridade">
            <Star size={12} className={styles.starIcon} />
            <span>{formatarSimilaridade(produto.similaridade)}% match</span>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <p className={styles.autor} data-cy="ia-produto-autor">
          por {produto.autor}
        </p>
        <p className={styles.categoria} data-cy="ia-produto-categoria">
          {produto.categoria}
        </p>
        {produto.isbn && (
          <p className={styles.isbn} data-cy="ia-produto-isbn">
            ISBN: {produto.isbn}
          </p>
        )}
        <p className={styles.sinopse}>{produto.sinopse}</p>
        <p className={styles.motivo} data-cy="ia-produto-motivo">
          <strong>Por que recomendamos:</strong> {produto.motivo}
        </p>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.preco} data-cy="ia-produto-preco">
          {formatarPreco(produto.preco)}
        </div>
        <a
          href={`/livro/${produto.uuid}`}
          className={styles.link}
          data-cy="ia-produto-link"
        >
          Ver detalhes
        </a>
      </div>
    </div>
  );
};
