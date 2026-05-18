'use client';

/**
 * Meus Pedidos page - Client Component with Redux
 * Migrated from src/pages-react-router/Vendas/MeusPedidos/MeusPedidos.tsx
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { usePedidos } from '@/hooks/usePedidos';
import { fetchPerfilCompleto } from '@/store/slices/clienteSlice';
import type { StatusPedido, IPedido } from '@/interfaces/pedido';
import type { ILivro } from '@/interfaces/livro';
import styles from '@/pages-react-router/Vendas/MeusPedidos/style.module.css';
import { mergeLivrosDestaqueEAdmin } from '@/utils/livrosLookup';
import { PedidoCard } from '@/pages-react-router/Vendas/MeusPedidos/PedidoCard';
import { ModalRastrearPedido } from '@/pages-react-router/Vendas/MeusPedidos/ModalRastrearPedido';
import { ModalDetalhesPedido } from '@/pages-react-router/Vendas/MeusPedidos/ModalDetalhesPedido';

type AbaGrupo = 'todos' | 'aberto' | 'finalizados';

const STATUS_EM_ABERTO: StatusPedido[] = [
  'Pendentes',
  'Aguardando Pagamento',
  'Em Processamento',
  'Preparando',
  'Em Trânsito',
  'Em Troca',
  'Troca Autorizada',
  'Devoluções',
];

const STATUS_FINALIZADOS: StatusPedido[] = ['Entregue', 'Trocado', 'Cancelado'];

function passaAbaGrupo(p: IPedido, aba: AbaGrupo): boolean {
  if (aba === 'todos') return true;
  if (aba === 'aberto') return STATUS_EM_ABERTO.includes(p.status);
  return STATUS_FINALIZADOS.includes(p.status);
}

export default function MeusPedidosPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const enderecos = useAppSelector((state) => state.cliente.enderecos);
  const livrosDestaque = useAppSelector((state) => state.livro.livrosDestaque);
  const livrosAdmin = useAppSelector((state) => state.livro.livrosAdmin);
  const livrosMerged = useMemo(
    () => mergeLivrosDestaqueEAdmin(livrosDestaque, livrosAdmin),
    [livrosDestaque, livrosAdmin],
  );
  const livrosMap = useMemo(() => {
    const m = new Map<string, ILivro>();
    for (const l of livrosMerged) {
      m.set(l.uuid, l);
    }
    return m;
  }, [livrosMerged]);

  const { pedidos, loading, error } = usePedidos(user?.uuid);
  const [abaGrupo, setAbaGrupo] = useState<AbaGrupo>('todos');
  const [pedidoSelecionado, setPedidoSelecionado] = useState<IPedido | null>(null);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalRastreamentoAberto, setModalRastreamentoAberto] = useState(false);

  useEffect(() => {
    if (user?.uuid) {
      dispatch(fetchPerfilCompleto(user.uuid));
    }
  }, [dispatch, user]);

  const pedidosFiltrados = useMemo(
    () => pedidos.filter((p) => passaAbaGrupo(p, abaGrupo)),
    [pedidos, abaGrupo],
  );

  const handleAbrirDetalhes = (pedido: IPedido) => {
    setPedidoSelecionado(pedido);
    setModalDetalhesAberto(true);
  };

  const handleAbrirRastreamento = (pedido: IPedido) => {
    setPedidoSelecionado(pedido);
    setModalRastreamentoAberto(true);
  };

  if (loading) {
    return <div className={styles['meus-pedidos-loading']}>Carregando seus pedidos...</div>;
  }

  if (error) {
    return <div className={styles['meus-pedidos-erro']}>{error || 'Erro ao carregar pedidos'}</div>;
  }

  if (pedidos.length === 0) {
    return (
      <div className={styles['meus-pedidos-vazio']}>
        <h2>Você ainda não tem pedidos</h2>
        <p>Comece a comprar agora e veja seus pedidos aqui!</p>
        <Link href="/">
          <button className="btn-primary">Ver Catálogo</button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles['meus-pedidos-page']}>
      <h1 className={styles['meus-pedidos-titulo']}>Meus Pedidos</h1>

      <div className={styles['meus-pedidos-aba-container']}>
        <button
          className={`${styles['meus-pedidos-aba']} ${abaGrupo === 'todos' ? styles['meus-pedidos-aba-ativa'] : ''}`}
          onClick={() => setAbaGrupo('todos')}
        >
          Todos ({pedidos.length})
        </button>
        <button
          className={`${styles['meus-pedidos-aba']} ${abaGrupo === 'aberto' ? styles['meus-pedidos-aba-ativa'] : ''}`}
          onClick={() => setAbaGrupo('aberto')}
        >
          Em Aberto ({pedidos.filter((p) => STATUS_EM_ABERTO.includes(p.status)).length})
        </button>
        <button
          className={`${styles['meus-pedidos-aba']} ${abaGrupo === 'finalizados' ? styles['meus-pedidos-aba-ativa'] : ''}`}
          onClick={() => setAbaGrupo('finalizados')}
        >
          Finalizados ({pedidos.filter((p) => STATUS_FINALIZADOS.includes(p.status)).length})
        </button>
      </div>

      <div className={styles['meus-pedidos-lista']}>
        {pedidosFiltrados.map((pedido) => (
          <PedidoCard
            key={pedido.uuid}
            pedido={pedido}
            livrosMap={livrosMap}
            onRastrear={handleAbrirRastreamento}
            onDetalhes={handleAbrirDetalhes}
          />
        ))}
      </div>

      {modalDetalhesAberto && pedidoSelecionado && (
        <ModalDetalhesPedido
          pedido={pedidoSelecionado}
          livrosMap={livrosMap}
          enderecoPedido={(p) => enderecos.find((e) => e.uuid === p.enderecoUuid)}
          onClose={() => setModalDetalhesAberto(false)}
        />
      )}

      {modalRastreamentoAberto && pedidoSelecionado && (
        <ModalRastrearPedido
          pedido={pedidoSelecionado}
          onClose={() => setModalRastreamentoAberto(false)}
        />
      )}
    </div>
  );
}
