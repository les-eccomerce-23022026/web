/**
 * Bestsellers page - Server Component with SSR
 * Displays best-selling books
 */

import { buildCatalogoPageMeta } from 'lib/data/buildPageMeta';
import type { Metadata } from 'next';
import { MaisVendidos } from '../components/MaisVendidos';

export async function generateMetadata(): Promise<Metadata> {
  return buildCatalogoPageMeta({ titulo: 'Mais Vendidos - Barnes & Noble' });
}

export default async function MaisVendidosPage() {
  return <MaisVendidos />;
}
