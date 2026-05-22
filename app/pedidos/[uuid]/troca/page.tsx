'use client';

/**
 * Solicitar Troca page - Client Component with Redux
 * Migrated from src/pages-react-router/Vendas/SolicitarTroca/SolicitarTroca.tsx
 */

import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { solicitarTrocaThunk } from '@/store/slices/pedidoSlice';
import { PedidoService } from '@/services/pedidoService';
import type { IItemPedido } from '@/interfaces/pedido';
import styles from '@/pages-react-router/Vendas/SolicitarTroca/style.module.css';
import { mergeLivrosDestaqueEAdmin } from '@/utils/livrosLookup';

export default function SolicitarTrocaPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const uuid = params.uuid as string;

  const { pedidos } = useAppSelector((state) => state.pedido);
  const livrosDestaque = useAppSelector((state) => state.livro.livrosDestaque);
  const livrosAdmin = useAppSelector((state) => state.livro.livrosAdmin);
  const livrosParaTitulo = useMemo(
    () => mergeLivrosDestaqueEAdmin(livrosDestaque, livrosAdmin),
    [livrosDestaque, livrosAdmin],
  );

  const [itensSelecionados, setItensSelecionados] = useState<string[]>([]);
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [pedidoLocal, setPedidoLocal] = useState<typeof pedidos[0] | null>(null);

  // Busca o pedido no Redux state primeiro
  const pedidoRedux = pedidos.find((p) => p.uuid === uuid);
  
  // Se não encontrou no Redux, busca via API
  useEffect(() => {
    if (!pedidoRedux && !pedidoLocal && !carregando) {
      console.log('[SolicitarTrocaPage] Pedido não encontrado no Redux, buscando via API para UUID:', uuid);
      setCarregando(true);
      PedidoService.getPedidosByCliente('')
        .then((todosPedidos) => {
          const pedidoEncontrado = todosPedidos.find((p) => p.uuid === uuid);
          if (pedidoEncontrado) {
            console.log('[SolicitarTrocaPage] Pedido encontrado via API:', pedidoEncontrado.uuid);
            setPedidoLocal(pedidoEncontrado);
          } else {
            console.log('[SolicitarTrocaPage] Pedido não encontrado via API');
          }
        })
        .catch((err) => {
          console.error('[SolicitarTrocaPage] Erro ao buscar pedido via API:', err);
        })
        .finally(() => {
          setCarregando(false);
        });
    }
  }, [uuid, pedidoRedux, pedidoLocal, carregando]);

  const pedido = pedidoRedux || pedidoLocal;

  if (carregando) {
    return (
      <div className={styles['solicitar-troca-erro']} data-cy="troca-carregando">
        Carregando pedido...
      </div>
    );
  }
  if (!pedido) {
    return (
      <div className={styles['solicitar-troca-erro']} data-cy="troca-erro">
        Pedido não encontrado.
      </div>
    );
  }
  if (pedido.status !== 'Entregue') {
    return (
      <div className={styles['solicitar-troca-erro']} data-cy="troca-erro">
        Apenas pedidos com status &apos;Entregue&apos; podem ser trocados (RN0043).
      </div>
    );
  }

  const getLivroTitulo = (livroUuid: string): string => {
    const livro = livrosParaTitulo.find((l) => l.uuid === livroUuid);
    return livro?.titulo || livroUuid;
  };

  const toggleItem = (livroUuid: string) => {
    setItensSelecionados((prev) =>
      prev.includes(livroUuid)
        ? prev.filter((id) => id !== livroUuid)
        : [...prev, livroUuid],
    );
  };

  const handleSubmit = async () => {
    if (itensSelecionados.length === 0) {
      setErro('Selecione pelo menos um item para troca.');
      return;
    }
    if (!motivo.trim()) {
      setErro('Informe o motivo da troca.');
      return;
    }

    setEnviando(true);
    setErro('');
    try {
      await dispatch(
        solicitarTrocaThunk({ pedidoUuid: pedido.uuid, motivo, itensUuids: itensSelecionados }),
      ).unwrap();
      setSucesso(true);
      setTimeout(() => router.push('/pedidos'), 2000);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao solicitar troca.');
    } finally {
      setEnviando(false);
    }
  };

  if (sucesso) {
    return (
      <div className={styles['solicitar-troca-page']}>
        <div className={`card ${styles['solicitar-troca-sucesso']}`} data-cy="sucesso-troca">
          <h1>Troca Solicitada com Sucesso!</h1>
          <p>Redirecionando para Meus Pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['solicitar-troca-page']}>
      <h1 className={styles['solicitar-troca-titulo']}>Solicitar Troca</h1>

      <div className={`card ${styles['solicitar-troca-card']}`}>
        <div className={styles['solicitar-troca-info-pedido']}>
          <p><strong>Pedido:</strong> {pedido.uuid}</p>
          <p><strong>Data:</strong> {new Date(pedido.data).toLocaleDateString('pt-BR')}</p>
          <p><strong>Status:</strong> {pedido.status}</p>
        </div>

        <h2 className={styles['solicitar-troca-subtitulo']}>Selecione os itens para troca</h2>

        <div className={styles['solicitar-troca-itens']}>
          {pedido.itens.map((item: IItemPedido) => (
            <label
              key={item.livroUuid}
              className={`${styles['solicitar-troca-item']} ${
                itensSelecionados.includes(item.livroUuid) ? styles['solicitar-troca-item-selecionado'] : ''
              }`}
            >
              <input
                type="checkbox"
                data-cy={`troca-item-checkbox-${item.livroUuid}`}
                checked={itensSelecionados.includes(item.livroUuid)}
                onChange={() => toggleItem(item.livroUuid)}
              />
              <div className={styles['solicitar-troca-item-info']}>
                <p><strong>{getLivroTitulo(item.livroUuid)}</strong></p>
                <p>Quantidade: {item.quantidade}</p>
                <p>Preço: R$ {item.precoUnitario.toFixed(2)}</p>
              </div>
            </label>
          ))}
        </div>

        <div className={styles['solicitar-troca-form']}>
          <label htmlFor="motivo">
            <strong>Motivo da troca:</strong>
          </label>
          <textarea
            id="motivo"
            data-cy="troca-motivo-input"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={4}
            placeholder="Descreva o motivo da troca..."
            maxLength={500}
          />
        </div>

        {erro && (
          <p className={styles['solicitar-troca-erro']} data-cy="troca-erro">
            {erro}
          </p>
        )}

        <div className={styles['solicitar-troca-acoes']}>
          <button
            className="btn-secondary"
            onClick={() => router.push('/pedidos')}
            disabled={enviando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary"
            data-cy="btn-solicitar-troca"
            onClick={handleSubmit}
            disabled={enviando || itensSelecionados.length === 0}
          >
            {enviando ? 'Enviando...' : 'Solicitar Troca'}
          </button>
        </div>
      </div>
    </div>
  );
}
