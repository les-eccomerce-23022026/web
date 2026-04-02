import type { ILivro } from '@/interfaces/livro';

/**
 * Une destaques e lista admin para resolver título de livro em pedidos/trocas
 * sem duplicar UUID (admin tem prioridade de complemento se necessário — aqui admin só entra se UUID não existir em destaques).
 */
export function mergeLivrosDestaqueEAdmin(
  livrosDestaque: ILivro[],
  livrosAdmin: ILivro[],
): ILivro[] {
  const map = new Map<string, ILivro>();
  for (const l of livrosDestaque) {
    map.set(l.uuid, l);
  }
  for (const l of livrosAdmin) {
    if (!map.has(l.uuid)) {
      map.set(l.uuid, l);
    }
  }
  return Array.from(map.values());
}
