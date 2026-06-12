'use client';

import { useState, useEffect } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useAnaliseVendasCategoria } from '@/hooks/useAnaliseVendasCategoria';
import { GraficoLinhasVendas } from '../GraficoLinhasVendas';
import styles from './GraficoAnaliseVendasDashboard.module.css';

const CATEGORIAS_DISPONIVEIS = [
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
] as const;

export function GraficoAnaliseVendasDashboard() {
  const { dados, loading, error, buscarDados } = useAnaliseVendasCategoria();
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);

  useEffect(() => {
    const dataFimPadrao = new Date();
    const dataInicioPadrao = new Date();
    dataInicioPadrao.setMonth(dataInicioPadrao.getMonth() - 13);

    const dataInicioStr = dataInicioPadrao.toISOString().split('T')[0];
    const dataFimStr = dataFimPadrao.toISOString().split('T')[0];

    setDataInicio(dataInicioStr);
    setDataFim(dataFimStr);

    buscarDados({
      dataInicio: dataInicioStr,
      dataFim: dataFimStr,
    });
  }, [buscarDados]);

  const toggleFiltros = () => {
    setFiltrosVisiveis(prev => !prev);
  };

  const toggleCategoria = (categoria: string) => {
    setCategoriasSelecionadas(prev =>
      prev.includes(categoria)
        ? prev.filter(c => c !== categoria)
        : [...prev, categoria]
    );
  };

  const aplicarFiltros = () => {
    if (!dataInicio || !dataFim) return;

    buscarDados({
      dataInicio,
      dataFim,
      categorias: categoriasSelecionadas.length > 0 ? categoriasSelecionadas : undefined,
    });
  };

  const limparFiltros = () => {
    const dataFimPadrao = new Date();
    const dataInicioPadrao = new Date();
    dataInicioPadrao.setMonth(dataInicioPadrao.getMonth() - 13);

    const dataInicioStr = dataInicioPadrao.toISOString().split('T')[0];
    const dataFimStr = dataFimPadrao.toISOString().split('T')[0];

    setDataInicio(dataInicioStr);
    setDataFim(dataFimStr);
    setCategoriasSelecionadas([]);

    buscarDados({
      dataInicio: dataInicioStr,
      dataFim: dataFimStr,
    });
  };

  if (error) {
    return (
      <div className="painel-grafico">
        <h3 className="painel-grafico__titulo">Análise de Vendas por Categoria</h3>
        <div className={styles.erro}>Erro ao carregar dados</div>
      </div>
    );
  }

  return (
    <div className="painel-grafico">
      <div className={styles.cabecalhoGrafico}>
        <h3 className="painel-grafico__titulo">Análise de Vendas por Categoria</h3>
        <button
          className={styles.botaoToggleFiltros}
          onClick={toggleFiltros}
          aria-label={filtrosVisiveis ? 'Ocultar filtros' : 'Mostrar filtros'}
        >
          <Filter size={16} />
          {filtrosVisiveis ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {filtrosVisiveis && (
        <div className={styles.painelFiltros}>
          <div className={styles.linhaFiltros}>
            <div className={styles.campoFiltro}>
              <label htmlFor="dataInicio">Início</label>
              <input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className={styles.inputData}
              />
            </div>
            <div className={styles.campoFiltro}>
              <label htmlFor="dataFim">Fim</label>
              <input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
                className={styles.inputData}
              />
            </div>
          </div>

          <div className={styles.secaoCategorias}>
            <label className={styles.labelCategorias}>Categorias</label>
            <div className={styles.gridCategorias}>
              {CATEGORIAS_DISPONIVEIS.map(cat => (
                <label key={cat} className={styles.checkboxCategoria}>
                  <input
                    type="checkbox"
                    checked={categoriasSelecionadas.includes(cat)}
                    onChange={() => toggleCategoria(cat)}
                  />
                  <span className={styles.nomeCategoria}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.botoesAcao}>
            <button
              onClick={aplicarFiltros}
              disabled={loading}
              className={styles.botaoPrimario}
            >
              {loading ? 'Aplicando...' : 'Aplicar'}
            </button>
            <button
              onClick={limparFiltros}
              disabled={loading}
              className={styles.botaoSecundario}
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      <div className={styles.containerGrafico}>
        {loading ? (
          <div className={styles.carregando}>Carregando gráfico...</div>
        ) : (
          <GraficoLinhasVendas dados={dados} />
        )}
      </div>

      {dados && (
        <div className={styles.metadados}>
          <span className={styles.metadadoItem}>
            Total: <strong>{dados.metadados.totalVendas}</strong>
          </span>
          <span className={styles.metadadoItem}>
            Categorias: <strong>{dados.metadados.totalCategorias}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
