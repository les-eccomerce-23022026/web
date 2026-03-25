import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutService } from '@/services/CheckoutService';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { limparCarrinho } from '@/store/slices/carrinhoSlice';
import type { ICheckoutInfo } from '@/interfaces/ICheckout';
import type { IVendaResultado } from '@/services/contracts/ICheckoutService';

export function useCheckout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [data, setData] = useState<ICheckoutInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [finalizando, setFinalizando] = useState<boolean>(false);

  const carrinho = useAppSelector((state) => state.carrinho.data);
  const usuario = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    CheckoutService.getCheckoutInfo()
      .then((checkoutData) => {
        setData(checkoutData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  const handleFinalizarCompra = async () => {
    if (!carrinho || !usuario) return;
    
    setFinalizando(true);
    try {
      const payload = {
        usuarioUuid: usuario.uuid,
        itens: carrinho.itens.map(it => ({
          livroUuid: it.uuid,
          quantidade: it.quantidade,
          precoUnitario: it.precoUnitario
        })),
        valorTotalItens: carrinho.resumo.subtotal,
        valorFrete: carrinho.resumo.frete,
        valorTotal: carrinho.resumo.total
      };

      const resultado = await CheckoutService.finalizarCompra(payload) as IVendaResultado;

      // Limpa carrinho e redireciona
      dispatch(limparCarrinho());
      navigate(`/pedido-confirmado?pedido=${resultado.id || resultado.ven_uuid || 'sucesso'}`);
    } catch (err: unknown) {
      alert('Erro ao finalizar compra: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    } finally {
      setFinalizando(false);
    }
  };

  return { data, loading, error, finalizando, handleFinalizarCompra };
}
