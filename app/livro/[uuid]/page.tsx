/**
 * Book detail page - Server Component with SSR
 * Uses migrated DetalhesLivro component
 */

import { fetchLivroByUuid } from 'lib/data/fetchLivro';
import { buildLivroPageMeta } from 'lib/data/buildPageMeta';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DetalhesLivro } from 'app/components/DetalhesLivro';

interface PageProps {
  params: Promise<{
    uuid: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { uuid } = await params;
  const livro = await fetchLivroByUuid(uuid);

  if (!livro) {
    return {
      title: 'Livro não encontrado - Barnes & Noble',
    };
  }

  return buildLivroPageMeta(livro);
}

export default async function LivroPage({ params }: PageProps) {
  const { uuid } = await params;
  const livro = await fetchLivroByUuid(uuid);

  if (!livro) {
    notFound();
  }

  return <DetalhesLivro livro={livro} />;
}
