import { memo } from 'react';
import { Calendar } from 'lucide-react';
import styles from './FiltroPeriodo.module.css';

export type PeriodoFiltro = '7d' | '30d' | '1w' | '2w' | '1m' | '3m' | '6m' | '1a' | 'todos';

interface FiltroPeriodoProps {
  periodoSelecionado: PeriodoFiltro;
  onChangePeriodo: (periodo: PeriodoFiltro) => void;
}

const PERIODOS: Record<PeriodoFiltro, string> = {
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  '1w': 'Última semana',
  '2w': 'Últimas 2 semanas',
  '1m': 'Último mês',
  '3m': 'Últimos 3 meses',
  '6m': 'Últimos 6 meses',
  '1a': 'Último ano',
  'todos': 'Todos',
};

export const FiltroPeriodo = memo(function FiltroPeriodo({ periodoSelecionado, onChangePeriodo }: FiltroPeriodoProps) {
  return (
    <div className={styles.filtroPeriodo}>
      <Calendar size={16} className={styles.icone} />
      <select
        value={periodoSelecionado}
        onChange={(e) => onChangePeriodo(e.target.value as PeriodoFiltro)}
        className={styles.select}
      >
        {Object.entries(PERIODOS).map(([valor, rotulo]) => (
          <option key={valor} value={valor}>
            {rotulo}
          </option>
        ))}
      </select>
    </div>
  );
});
