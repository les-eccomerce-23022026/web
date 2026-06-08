'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAnaliseVendasCategoria } from '@/hooks/useAnaliseVendasCategoria';
import { FiltrosAnaliseVendas } from '@/components/Admin/FiltrosAnaliseVendas';
import styles from './page.module.css';

const GraficoLinhasVendas = dynamic(
  () => import('@/components/Admin/GraficoLinhasVendas').then(mod => ({ default: mod.GraficoLinhasVendas })),
  { ssr: false, loading: () => (
    <div className={styles.loadingGrafico}>
      <div className={styles.skeleton}></div>
    </div>
  ) }
);

export default function AnaliseVendasPage() {
  const { dados, loading, error, buscarDados } = useAnaliseVendasCategoria();

  useEffect(() => {
    const dataFim = new Date();
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - 13);

    buscarDados({
      dataInicio: dataInicio.toISOString().split('T')[0],
      dataFim: dataFim.toISOString().split('T')[0],
    });
  }, [buscarDados]);

  if (error) {
    return <div className={styles.error}>Erro: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Análise de Vendas por Categoria</h1>
      <div className={styles.content}>
        <div className={styles.filtros}>
          <FiltrosAnaliseVendas onFiltrar={buscarDados} loading={loading} />
        </div>
        <div className={styles.grafico}>
          {loading ? (
            <div className={styles.loading}>Carregando dados...</div>
          ) : (
            <GraficoLinhasVendas dados={dados} />
          )}
        </div>
      </div>
      {dados && (
        <div className={styles.metadados}>
          <p>Total de vendas: {dados.metadados.totalVendas}</p>
          <p>Total de categorias: {dados.metadados.totalCategorias}</p>
        </div>
      )}
    </div>
  );
}
