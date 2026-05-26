import React, { useState } from 'react';
import './CapaLivro.css';

interface CapaLivroProps {
  src?: string;
  alt: string;
  className?: string;
  titulo?: string;
}

export const CapaLivro: React.FC<CapaLivroProps> = ({ src, alt, className = '', titulo }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`capa-fallback ${className}`} title={alt}>
        <div className="capa-fallback__decoracao"></div>
        <span className="capa-fallback__titulo">{titulo || alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`capa-imagem ${className}`}
      onError={() => setError(true)}
    />
  );
};
