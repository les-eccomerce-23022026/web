'use client';

import { useCallback, useEffect, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ChartsCarousel.css';

interface ChartsCarouselProps {
  children: React.ReactNode[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

// Memoiza cada slide individualmente para evitar rerenders desnecessários
const CarouselSlide = memo(({ children }: { children: React.ReactNode }) => (
  <div className="carousel-slide">{children}</div>
));

CarouselSlide.displayName = 'CarouselSlide';

export function ChartsCarousel({ children, currentIndex, onIndexChange }: ChartsCarouselProps) {
  const goToPrevious = useCallback(() => {
    onIndexChange(currentIndex === 0 ? children.length - 1 : currentIndex - 1);
  }, [children.length, currentIndex, onIndexChange]);

  const goToNext = useCallback(() => {
    onIndexChange(currentIndex === children.length - 1 ? 0 : currentIndex + 1);
  }, [children.length, currentIndex, onIndexChange]);

  const goToSlide = useCallback((index: number) => {
    onIndexChange(index);
  }, [onIndexChange]);

  // Previne mudanças de slide acidentais quando o número de children muda
  useEffect(() => {
    if (currentIndex >= children.length) {
      onIndexChange(0);
    }
  }, [children.length, currentIndex]);

  return (
    <div className="charts-carousel">
      <button 
        className="carousel-button carousel-button--prev" 
        onClick={goToPrevious}
        aria-label="Gráfico anterior"
        type="button"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="carousel-track">
        <div 
          className="carousel-slides"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {children.map((child, index) => (
            <CarouselSlide key={`slide-${index}`}>
              {child}
            </CarouselSlide>
          ))}
        </div>
      </div>

      <button 
        className="carousel-button carousel-button--next" 
        onClick={goToNext}
        aria-label="Próximo gráfico"
        type="button"
      >
        <ChevronRight size={24} />
      </button>

      <div className="carousel-indicators">
        {children.map((_, index) => (
          <button
            key={`indicator-${index}`}
            className={`carousel-indicator ${index === currentIndex ? 'carousel-indicator--active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Ir para gráfico ${index + 1}`}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
