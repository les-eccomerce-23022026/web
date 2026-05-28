'use client';

import { AdminKPIs } from '@/components/Admin/AdminKPIs';
import { Package, AlertTriangle, DollarSign } from 'lucide-react';
import type { IKpisEstoque } from '@/services/contracts/estoqueService';

interface IKPIsEstoqueProps {
  kpis: IKpisEstoque;
}

export function KPIsEstoque({ kpis }: IKPIsEstoqueProps) {
  const kpisData = [
    {
      id: 'total-livros',
      label: 'Total de Livros',
      value: kpis.totalLivros,
      icon: Package,
      variant: 'default' as const,
    },
    {
      id: 'abaixo-limite',
      label: 'Abaixo do Limite',
      value: kpis.abaixoLimite,
      icon: AlertTriangle,
      variant: 'critico' as const,
    },
    {
      id: 'valor-total',
      label: 'Valor Total Estoque',
      value: `R$ ${kpis.valorTotalEstoque.toFixed(2)}`,
      icon: DollarSign,
      variant: 'receita' as const,
    },
    {
      id: 'qtd-disponivel',
      label: 'Qtd. Disponível',
      value: kpis.quantidadeTotalDisponivel,
      icon: Package,
      variant: 'default' as const,
    },
  ];

  return <AdminKPIs kpis={kpisData} columns={4} enableCarousel={true} />;
}
