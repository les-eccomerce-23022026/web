import { Users, UserCheck, UserX, AlertCircle } from 'lucide-react';
import type { ItemKPI } from '../../../components/Admin/AdminKPIs/types';
import type { IAdmin } from '../../../interfaces/admin';

export function obterKPIsAdmins(admins: IAdmin[]): ItemKPI[] {
  const totalAdmins = admins.length;
  const adminsAtivos = admins.filter((a) => a.ativo === true).length;
  const adminsInativos = admins.filter((a) => a.ativo === false).length;
  const totalTrocasPendentes = admins.reduce((total, admin) => total + (admin.trocasPendentes || 0), 0);

  return [
    {
      id: 'total-admins',
      label: 'Total de Administradores',
      value: totalAdmins,
      icon: Users,
      variant: 'default',
    },
    {
      id: 'admins-ativos',
      label: 'Administradores Ativos',
      value: adminsAtivos,
      icon: UserCheck,
      variant: 'estoque',
    },
    {
      id: 'admins-inativos',
      label: 'Administradores Inativos',
      value: adminsInativos,
      icon: UserX,
      variant: 'critico',
    },
    {
      id: 'trocas-pendentes',
      label: 'Trocas Pendentes',
      value: totalTrocasPendentes,
      icon: AlertCircle,
      variant: 'receita',
    },
  ];
}
