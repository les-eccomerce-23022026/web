import { useState } from 'react';
import type { IFiltroAnaliseVendas } from '../../services/contracts/analiseVendasService';
import styles from './FiltrosAnaliseVendas.module.css';

interface IFiltrosAnaliseVendasProps {
  onFiltrar: (filtro: IFiltroAnaliseVendas) => void;
  loading: boolean;
}

export function FiltrosAnaliseVendas({ onFiltrar, loading }: IFiltrosAnaliseVendasProps) {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);

  const categoriasDisponiveis = [
    'Fantasia',
    'Ficção Científica',
    'Clássicos',
    'Distopia',
    'Literatura Brasileira',
    'Negócios',
    'Tecnologia',
    'Aventura',
    'Young Adult',
    'Romance',
    'Terror',
    'Mistério',
    'Humor',
    'Desenvolvimento Pessoal',
    'História',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataInicio || !dataFim) return;

    onFiltrar({
      dataInicio,
      dataFim,
      categorias: categoriasSelecionadas.length > 0 ? categoriasSelecionadas : undefined,
    });
  };

  const toggleCategoria = (categoria: string) => {
    setCategoriasSelecionadas(prev =>
      prev.includes(categoria)
        ? prev.filter(c => c !== categoria)
        : [...prev, categoria]
    );
  };

  return (
    <form onSubmit={handleSubmit} className={styles.containerFiltros}>
      <div className={styles.linhaFiltro}>
        <div className={styles.grupoFiltro}>
          <label htmlFor="dataInicio">Data Início</label>
          <input
            id="dataInicio"
            type="date"
            value={dataInicio}
            onChange={e => setDataInicio(e.target.value)}
            required
          />
        </div>
        <div className={styles.grupoFiltro}>
          <label htmlFor="dataFim">Data Fim</label>
          <input
            id="dataFim"
            type="date"
            value={dataFim}
            onChange={e => setDataFim(e.target.value)}
            required
          />
        </div>
      </div>
      <div className={styles.grupoCategorias}>
        <label>Categorias</label>
        <div className={styles.gridCategorias}>
          {categoriasDisponiveis.map(cat => (
            <label key={cat} className={styles.checkboxCategoria}>
              <input
                type="checkbox"
                checked={categoriasSelecionadas.includes(cat)}
                onChange={() => toggleCategoria(cat)}
              />
              {cat}
            </label>
          ))}
        </div>
      </div>
      <button type="submit" className={styles.botaoAnalisar} disabled={loading}>
        {loading ? 'Carregando...' : 'Aplicar Filtros'}
      </button>
    </form>
  );
}
