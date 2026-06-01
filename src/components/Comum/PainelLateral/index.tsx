'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './PainelLateral.module.css';

interface PainelLateralProps {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  lado?: 'esquerda' | 'direita';
  largura?: string;
  children: React.ReactNode;
  dataCy?: string;
}

/**
 * Componente genérico de painel lateral (drawer/sidebar).
 * Reutilizável — não acoplado ao chat nem a nenhum domínio.
 *
 * - Overlay semitransparente fecha ao clicar fora
 * - Painel desliza da esquerda (padrão) ou direita
 * - z-index acima do header (~300)
 * - Tecla Escape fecha o painel
 * - Foco inicial no botão fechar (trap básico de a11y)
 * - role="dialog" + aria-modal="true"
 */
export const PainelLateral = ({
  aberto,
  onFechar,
  titulo,
  lado = 'esquerda',
  largura = 'min(420px, 100vw)',
  children,
  dataCy,
}: PainelLateralProps) => {
  const botaoFecharRef = useRef<HTMLButtonElement>(null);

  // Fecha com Escape
  useEffect(() => {
    if (!aberto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aberto, onFechar]);

  // Foco inicial no botão fechar ao abrir (trap básico de a11y)
  useEffect(() => {
    if (!aberto) return;
    botaoFecharRef.current?.focus();
  }, [aberto]);

  if (!aberto) return null;

  return (
    <>
      {/* Overlay — fecha ao clicar fora */}
      <div
        className={styles.overlay}
        onClick={onFechar}
        aria-hidden="true"
        data-cy={dataCy ? `${dataCy}-overlay` : 'painel-lateral-overlay'}
      />

      {/* Painel lateral */}
      <div
        className={`${styles.painel} ${lado === 'direita' ? styles.painelDireita : styles.painelEsquerda}`}
        style={{ '--painel-largura': largura } as React.CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        data-cy={dataCy ?? 'painel-lateral'}
      >
        {/* Cabeçalho: título + botão fechar (foco inicial — trap básico) */}
        <div className={styles.cabecalho}>
          <span className={styles.titulo}>{titulo}</span>
          <button
            ref={botaoFecharRef}
            className={styles.botaoFechar}
            onClick={onFechar}
            aria-label="Fechar painel"
            data-cy={dataCy ? `${dataCy}-fechar` : 'painel-lateral-fechar'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Área de conteúdo — preenchida pelo children */}
        <div className={styles.conteudo}>
          {children}
        </div>
      </div>
    </>
  );
};
