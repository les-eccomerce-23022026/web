/**
 * Book detail page - Server Component with SSR for metadata only
 * Data fetching happens in client-side DetalhesLivro component
 */

import { fetchLivroByUuid } from 'lib/data/fetchLivro';
import { buildLivroPageMeta } from 'lib/data/buildPageMeta';
import type { Metadata } from 'next';
import { DetalhesLivro } from 'app/components/DetalhesLivro';

interface PageProps {
  params: Promise<{
    uuid: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { uuid } = await params;
  // Tenta buscar livro para metadata, mas não falha se não conseguir
  // Isso garante que SEO funcione em produção, mas não quebra testes E2E
  try {
    const livro = await fetchLivroByUuid(uuid);
    if (!livro) {
      return {
        title: 'Livro não encontrado - Barnes & Noble',
      };
    }
    return buildLivroPageMeta(livro);
  } catch {
    // Se falhar (ex: no SSR sem header), retorna metadata padrão
    return {
      title: 'Barnes & Noble - Livros',
    };
  }
}

export default async function LivroPage({ params }: PageProps) {
  const { uuid } = await params;
  // Passa o UUID para o componente client-side que fará o fetch
  return <DetalhesLivro livroUuid={uuid} />;
}
