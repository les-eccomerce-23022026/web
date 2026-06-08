'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ChartsCarousel.css';

interface ChartsCarouselProps {
  children: React.ReactNode[];
}

export function ChartsCarousel({ children }: ChartsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? children.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === children.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="charts-carousel">
      <button 
        className="carousel-button carousel-button--prev" 
        onClick={goToPrevious}
        aria-label="Gráfico anterior"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="carousel-track">
        <div 
          className="carousel-slides"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {children.map((child, index) => (
            <div key={index} className="carousel-slide">
              {child}
            </div>
          ))}
        </div>
      </div>

      <button 
        className="carousel-button carousel-button--next" 
        onClick={goToNext}
        aria-label="Próximo gráfico"
      >
        <ChevronRight size={24} />
      </button>

      <div className="carousel-indicators">
        {children.map((_, index) => (
          <button
            key={index}
            className={`carousel-indicator ${index === currentIndex ? 'carousel-indicator--active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Ir para gráfico ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
