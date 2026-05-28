import { BookOpen, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { ItemKPI } from '../../../components/Admin/AdminKPIs/types';
import type { ILivro } from '../../../interfaces/livro';
import { LIMITE_ESTOQUE_CRITICO } from '@/config/constantesNegocio';

export function obterKPIsLivros(livros: ILivro[]): ItemKPI[] {
  return [
    {
      id: 'total-livros',
      label: 'Total de Livros',
      value: livros.length,
      icon: BookOpen,
      variant: 'default',
    },
    {
      id: 'livros-ativos',
      label: 'Livros Ativos',
      value: livros.filter((l) => l.status === 'Ativo').length,
      icon: CheckCircle,
      variant: 'default',
    },
    {
      id: 'livros-inativos',
      label: 'Livros Inativos',
      value: livros.filter((l) => l.status === 'Inativo').length,
      icon: XCircle,
      variant: 'critico',
    },
    {
      id: 'estoque-critico',
      label: 'Estoque Crítico',
      value: livros.filter((l) => l.estoque <= LIMITE_ESTOQUE_CRITICO).length,
      icon: AlertTriangle,
      variant: 'critico',
    },
  ];
}
