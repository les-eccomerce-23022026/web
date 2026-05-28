'use client';

import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { IAdminToolbarProps } from './types';
import styles from './adminToolbar.module.css';

export const AdminToolbar = ({
  placeholderBusca,
  onBusca,
  filtros = [],
  onFiltroChange,
  acoes = [],
  mostrarBusca = true,
  mostrarFiltros = true,
}: IAdminToolbarProps) => {
  const [textoBusca, setTextoBusca] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onBusca(textoBusca);
    }, 300);

    return () => clearTimeout(timer);
  }, [textoBusca, onBusca]);

  const renderizarBusca = () => {
    if (!mostrarBusca) return null;

    return (
      <div className={styles.buscaWrapper}>
        <Search className={styles.iconeBusca} size={20} />
        <input
          type="text"
          className={styles.inputBusca}
          placeholder={placeholderBusca}
          value={textoBusca}
          onChange={(e) => setTextoBusca(e.target.value)}
          data-cy="admin-toolbar-search"
        />
      </div>
    );
  };

  const renderizarFiltros = () => {
    if (!mostrarFiltros || filtros.length === 0) return null;

    return (
      <div className={styles.filtrosWrapper}>
        {filtros.map((filtro) => (
          <select
            key={filtro.id}
            className={styles.selectFiltro}
            value={filtro.value}
            onChange={(e) => onFiltroChange?.(filtro.id, e.target.value)}
            data-cy={`admin-toolbar-filter-${filtro.id}`}
          >
            {filtro.opcoes.map((opcao) => (
              <option key={opcao.value} value={opcao.value}>
                {opcao.label}
              </option>
            ))}
          </select>
        ))}
      </div>
    );
  };

  const renderizarAcoes = () => {
    if (acoes.length === 0) return null;

    return (
      <div className={styles.acoesWrapper}>
        {acoes.map((acao, index) => {
          const Icone = acao.icone;
          const classeBotao =
            acao.variante === 'secundario'
              ? styles.botaoSecundario
              : styles.botaoPrimario;

          return (
            <button
              key={index}
              className={classeBotao}
              onClick={acao.onClick}
              data-cy={`admin-toolbar-action-${index}`}
            >
              {Icone && <Icone size={16} />}
              {acao.label}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.toolbar} data-cy="admin-toolbar">
      {renderizarBusca()}
      <div className={styles.direita}>
        {renderizarFiltros()}
        {renderizarAcoes()}
      </div>
    </div>
  );
};
