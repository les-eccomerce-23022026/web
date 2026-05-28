  'use client';

import { useState, useRef, useEffect } from 'react';
import { type LucideIcon } from 'lucide-react';
import styles from './adminKPIs.module.css';
import type { AdminKPIsProps, ItemKPI, VarianteKPI } from './types';

/**
 * Componente reutilizável de KPIs para painel administrativo.
 * - Exibe métricas em cards com ícones e tendências
 * - Suporta layout grid, flex ou carrossel (drag horizontal)
 * - Variantes de cor para diferentes contextos (receita, estoque, crítico)
 * - Responsivo: 1 coluna mobile, 2 tablet, auto-fit desktop
 * - Carrossel: arrastar para esquerda/direita com mouse ou touch
 */
export const AdminKPIs = ({ kpis, layout = 'grid', columns = 4, enableCarousel = false }: AdminKPIsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  if (!kpis || kpis.length === 0) return null;

  const obterClasseVariante = (variant?: VarianteKPI, color?: string): string => {
    if (color) return styles.iconeCustom;
    if (variant === 'receita') return styles.iconeReceita;
    if (variant === 'estoque') return styles.iconeEstoque;
    if (variant === 'critico') return styles.iconeCritico;
    return styles.iconeDefault;
  };

  const obterClasseTendencia = (valor: number): string => {
    if (valor > 0) return styles.tendenciaPositiva;
    if (valor < 0) return styles.tendenciaNegativa;
    return styles.tendenciaNeutra;
  };

  const renderizarTendencia = (trend?: { valor: number; label?: string }) => {
    if (!trend) return null;

    const sinal = trend.valor > 0 ? '+' : '';
    return (
      <span className={`${styles.tendencia} ${obterClasseTendencia(trend.valor)}`}>
        ({sinal}{trend.valor}%{trend.label ? ` ${trend.label}` : ''})
      </span>
    );
  };

  const renderizarKPI = (kpi: ItemKPI) => {
    const Icone = kpi.icon as LucideIcon;
    const classeVariante = obterClasseVariante(kpi.variant, kpi.color);

    return (
      <div key={kpi.id} className={styles.card} data-cy={`kpi-${kpi.id}`}>
        <div className={`${styles.icone} ${classeVariante}`}>
          <Icone size={24} strokeWidth={2.5} />
        </div>
        <div className={styles.info}>
          <span className={styles.valor}>{kpi.value}</span>
          <span className={styles.rotulo}>
            {kpi.label}
            {renderizarTendencia(kpi.trend)}
          </span>
        </div>
      </div>
    );
  };

  // Handlers do carrossel
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
    // Desabilitar scroll suave durante o arraste para melhor fluidez
    carouselRef.current.style.scrollBehavior = 'auto';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Velocidade do arraste
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    if (!carouselRef.current) return;
    setIsDragging(false);
    // Reabilitar scroll suave após soltar
    carouselRef.current.style.scrollBehavior = 'smooth';
  };

  const handleMouseLeave = () => {
    if (!carouselRef.current) return;
    setIsDragging(false);
    // Reabilitar scroll suave ao sair do container
    carouselRef.current.style.scrollBehavior = 'smooth';
  };

  const classeLayout = layout === 'flex' ? styles.containerFlex : styles.containerGrid;
  const classeCarousel = enableCarousel ? styles.containerCarousel : '';
  const estiloGrid = layout === 'grid' && columns > 0 
    ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } 
    : undefined;

  return (
    <div 
      className={`${styles.container} ${classeLayout} ${classeCarousel}`}
      style={estiloGrid}
      ref={carouselRef}
      onMouseDown={enableCarousel ? handleMouseDown : undefined}
      onMouseMove={enableCarousel ? handleMouseMove : undefined}
      onMouseUp={enableCarousel ? handleMouseUp : undefined}
      onMouseLeave={enableCarousel ? handleMouseLeave : undefined}
    >
      {kpis.map(renderizarKPI)}
    </div>
  );
};
