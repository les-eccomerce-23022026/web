import { memo } from 'react';
import { Filter } from 'lucide-react';
import styles from './FiltroStatus.module.css';

export type StatusFiltro = 'todos' | 'entregue' | 'transito' | 'preparando' | 'pendente' | 'devolucao';

interface FiltroStatusProps {
  statusSelecionado: StatusFiltro;
  onChangeStatus: (status: StatusFiltro) => void;
}

const STATUS: Record<StatusFiltro, string> = {
  'todos': 'Todos',
  'entregue': 'Entregues',
  'transito': 'Em Trânsito',
  'preparando': 'Preparando',
  'pendente': 'Pendentes',
  'devolucao': 'Devoluções',
};

export const FiltroStatus = memo(function FiltroStatus({ statusSelecionado, onChangeStatus }: FiltroStatusProps) {
  return (
    <div className={styles.filtroStatus}>
      <Filter size={16} className={styles.icone} />
      <select
        value={statusSelecionado}
        onChange={(e) => onChangeStatus(e.target.value as StatusFiltro)}
        className={styles.select}
      >
        {Object.entries(STATUS).map(([valor, rotulo]) => (
          <option key={valor} value={valor}>
            {rotulo}
          </option>
        ))}
      </select>
    </div>
  );
});
