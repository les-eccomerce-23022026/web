import { useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import {
  sincronizarLinhaCarrinho,
  limparCarrinhoRemoto,
  removerItem,
  atualizarQuantidade,
  limparCarrinho,
} from '@/store/slices/carrinhoSlice';

export function useCarrinhoHandlers(usarCarrinhoLocal: boolean) {
  const dispatch = useAppDispatch();

  const handleUpdateQuantidade = useCallback((uuid: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const qtd = parseInt(event.target.value, 10);
    if (!Number.isFinite(qtd) || qtd < 1) return;

    if (usarCarrinhoLocal) {
      dispatch(atualizarQuantidade({ uuid, quantidade: qtd }));
      return;
    }

    void dispatch(sincronizarLinhaCarrinho({ livroUuid: uuid, quantidade: qtd }));
  }, [dispatch, usarCarrinhoLocal]);

  const handleRemover = useCallback((uuid: string) => {
    if (usarCarrinhoLocal) {
      dispatch(removerItem(uuid));
      return;
    }

    void dispatch(sincronizarLinhaCarrinho({ livroUuid: uuid, quantidade: 0 }));
  }, [dispatch, usarCarrinhoLocal]);

  const handleLimpar = useCallback(() => {
    if (usarCarrinhoLocal) {
      dispatch(limparCarrinho());
      return;
    }

    void dispatch(limparCarrinhoRemoto());
  }, [dispatch, usarCarrinhoLocal]);

  return { handleUpdateQuantidade, handleRemover, handleLimpar };
}
