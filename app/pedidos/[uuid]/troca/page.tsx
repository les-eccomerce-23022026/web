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
import { ROTAS } from '@/config/rotas';

function verificarPrazoTroca(pedido: { dataEntrega?: string; status: string }): {
  dentroPrazo: boolean;
  diasRestantes: number;
} {
  if (pedido.status !== 'Entregue') {
    return { dentroPrazo: false, diasRestantes: 0 };
  }
  if (!pedido.dataEntrega) {
    return { dentroPrazo: true, diasRestantes: 7 };
  }
  const dataEntrega = new Date(pedido.dataEntrega);
  const hoje = new Date();
  const diffDias = Math.floor((hoje.getTime() - dataEntrega.getTime()) / (1000 * 60 * 60 * 24));
  const diasRestantes = 7 - diffDias;
  return {
    dentroPrazo: diasRestantes > 0,
    diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
  };
}

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

  const pedidoRedux = pedidos.find((p) => p.uuid === uuid);

  // Sempre atualiza via API (garante dataEntrega e status recentes — RN0043 / E2E)
  useEffect(() => {
    if (!uuid) return;
    setCarregando(true);
    PedidoService.getPedidosByCliente('')
      .then((todosPedidos) => {
        const pedidoEncontrado = todosPedidos.find((p) => p.uuid === uuid) ?? null;
        setPedidoLocal(pedidoEncontrado);
      })
      .catch((err) => {
        console.error('[SolicitarTrocaPage] Erro ao buscar pedido via API:', err);
        setPedidoLocal(null);
      })
      .finally(() => {
        setCarregando(false);
      });
  }, [uuid]);

  const pedido = pedidoLocal ?? pedidoRedux;

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
      setTimeout(() => router.push(ROTAS.PEDIDOS), 2000);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao solicitar troca.');
    } finally {
      setEnviando(false);
    }
  };

  const prazoTroca = verificarPrazoTroca(pedido);

  if (sucesso) {
    return (
      <div className={styles['solicitar-troca-page']}>
        <div className={`card ${styles['solicitar-troca-sucesso']}`} data-cy="sucesso-troca">
          <h1>Troca Solicitada com Sucesso!</h1>
          <p data-cy="redirecionando-mensagem">Redirecionando para Meus Pedidos...</p>
        </div>
      </div>
    );
  }

  if (!prazoTroca.dentroPrazo) {
    return (
      <div className={styles['solicitar-troca-page']}>
        <h1 className={styles['solicitar-troca-titulo']}>Solicitar Troca</h1>
        <div className={styles['solicitar-troca-erro']} data-cy="erro-prazo-expirado">
          Prazo de 7 dias para troca expirado (RN0043).
        </div>
        <p data-cy="erro-status-entregue">Status: {pedido.status}</p>
        <p data-cy="info-prazo-7-dias">
          <span data-cy="info-prazo-texto">
            Você tem até 7 dias corridos após a entrega para solicitar troca ou devolução.
          </span>
        </p>
        <button type="button" className="btn-primary" data-cy="btn-solicitar-troca" disabled>
          Solicitar Troca
        </button>
      </div>
    );
  }

  return (
    <div className={styles['solicitar-troca-page']}>
      <h1 className={styles['solicitar-troca-titulo']}>Solicitar Troca</h1>

      <p data-cy="info-prazo-7-dias">
        <span data-cy="info-prazo-texto">
          Prazo legal: 7 dias corridos após a entrega (RN0043).
        </span>
        {' '}
        <span data-cy="contador-dias-restantes">
          <span data-cy="texto-restantes">{prazoTroca.diasRestantes} dias restantes</span>
        </span>
      </p>

      <div className={`card ${styles['solicitar-troca-card']}`}>
        <div className={styles['solicitar-troca-info-pedido']}>
          <p><strong>Pedido:</strong> {pedido.uuid}</p>
          <p><strong>Data:</strong> {new Date(pedido.data).toLocaleDateString('pt-BR')}</p>
          <p data-cy="erro-status-entregue"><strong>Status:</strong> {pedido.status}</p>
        </div>

        <h2 className={styles['solicitar-troca-subtitulo']} data-cy="troca-itens-titulo">
          Selecione os itens para troca
        </h2>

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
          <label htmlFor="motivo" data-cy="troca-motivo-label">
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

        {erro === 'Selecione pelo menos um item para troca.' && (
          <p className={styles['solicitar-troca-erro']} data-cy="erro-selecionar-item">
            {erro}
          </p>
        )}
        {erro === 'Informe o motivo da troca.' && (
          <p className={styles['solicitar-troca-erro']} data-cy="erro-motivo-obrigatorio">
            {erro}
          </p>
        )}
        {erro && erro !== 'Selecione pelo menos um item para troca.' && erro !== 'Informe o motivo da troca.' && (
          <p className={styles['solicitar-troca-erro']} data-cy="troca-erro">
            {erro}
          </p>
        )}

        <div className={styles['solicitar-troca-acoes']}>
          <button
            className="btn-secondary"
            onClick={() => router.push(ROTAS.PEDIDOS)}
            disabled={enviando}
            data-cy="btn-cancelar-troca"
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary"
            data-cy="btn-solicitar-troca"
            onClick={handleSubmit}
            disabled={enviando || !prazoTroca.dentroPrazo}
          >
            {enviando ? 'Enviando...' : 'Solicitar Troca'}
          </button>
        </div>
      </div>
    </div>
  );
}
