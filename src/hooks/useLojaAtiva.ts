import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  buscarLojaAtiva,
  definirLojaAtiva,
  limparLojaAtiva,
  selecionarLojaAtiva,
  selecionarCarregandoLoja,
  selecionarErroLoja,
} from '@/store/slices/lojaSlice';
import type { ILoja } from '@/interfaces/loja';

/**
 * Hook customizado para gerenciar a loja ativa.
 *
 * Responsabilidades:
 * - Ler cookie x-loja-uuid ao inicializar
 * - Buscar dados da loja via API (GET /api/loja/tenante/:loj_uuid)
 * - Armazenar loja ativa no Redux
 * - Fornecer métodos para trocar loja
 * - Fornecer seletor para obter loja ativa
 *
 * Uso:
 * ```tsx
 * const { lojaAtiva, carregando, erro, trocarLoja } = useLojaAtiva();
 * ```
 */
export function useLojaAtiva() {
  const dispatch = useAppDispatch();
  const lojaAtiva = useAppSelector(selecionarLojaAtiva);
  const carregando = useAppSelector(selecionarCarregandoLoja);
  const erro = useAppSelector(selecionarErroLoja);

  /**
   * Lê o UUID da loja do cookie x-loja-uuid.
   * Retorna null se o cookie não existir.
   */
  const lerLojaUuidDoCookie = useCallback((): string | null => {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [chave, valor] = cookie.trim().split('=');
      if (chave === 'x-loja-uuid') {
        return decodeURIComponent(valor);
      }
    }
    return null;
  }, []);

  /**
   * Inicializa a loja ativa ao montar o componente.
   * Lê o cookie x-loja-uuid e busca os dados da loja.
   */
  useEffect(() => {
    const lojaUuid = lerLojaUuidDoCookie();

    // Se não houver cookie, não fazer nada
    if (!lojaUuid) return;

    // Se a loja já está carregada e é a mesma, não fazer requisição
    if (lojaAtiva?.uuid === lojaUuid) return;

    // Buscar loja via API
    void dispatch(buscarLojaAtiva(lojaUuid));
  }, [dispatch, lojaAtiva?.uuid, lerLojaUuidDoCookie]);

  /**
   * Troca a loja ativa.
   * Busca os dados da nova loja via API.
   */
  const trocarLoja = useCallback(
    (novoLojaUuid: string) => {
      void dispatch(buscarLojaAtiva(novoLojaUuid));
    },
    [dispatch],
  );

  /**
   * Define a loja ativa manualmente (sem requisição à API).
   * Útil para testes ou quando a loja já está carregada.
   */
  const definirLoja = useCallback(
    (loja: ILoja) => {
      dispatch(definirLojaAtiva(loja));
    },
    [dispatch],
  );

  /**
   * Limpa a loja ativa e reseta o estado.
   */
  const limparLoja = useCallback(() => {
    dispatch(limparLojaAtiva());
  }, [dispatch]);

  return {
    lojaAtiva,
    carregando,
    erro,
    trocarLoja,
    definirLoja,
    limparLoja,
  };
}
