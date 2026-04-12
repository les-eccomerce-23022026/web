import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { usePedidos } from '@/hooks/usePedidos';
import { useFiltrosMeusPedidos } from '@/hooks/useFiltrosMeusPedidos';
import { fetchPerfilCompleto } from '@/store/slices/clienteSlice';
import { LoadingState } from '@/components/Comum/LoadingState/LoadingState';
import { EmptyState } from '@/components/Comum/EmptyState/EmptyState';
import { ErrorState } from '@/components/Comum/ErrorState/ErrorState';
import { Modal } from '@/components/Comum/Modal/Modal';
import type { IPedido, IItemPedido } from '@/interfaces/pedido';
import type { ILivro } from '@/interfaces/livro';
import styles from './MeusPedidos.module.css';
import { mergeLivrosDestaqueEAdmin } from '@/utils/livrosLookup';
import { CartaoResumoPedido } from './CartaoResumoPedido';

export const MeusPedidos = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const enderecos = useAppSelector((state) => state.cliente.enderecos);
  const livrosDestaque = useAppSelector((state) => state.livro.livrosDestaque);
  const livrosAdmin = useAppSelector((state) => state.livro.livrosAdmin);

  const { pedidos, isLoading, hasError } = usePedidos(user?.uuid);

  const {
    abaAtiva,
    statusAtivo,
    pedidosFiltrados,
    opcoesStatusDisponiveis,
    alterarAba,
    alterarStatusFiltro,
  } = useFiltrosMeusPedidos(pedidos);

  const [modalRastrear, setModalRastrear] = useState<IPedido | null>(null);
  const [modalDetalhes, setModalDetalhes] = useState<IPedido | null>(null);

  const livrosMap = useMemo(() => {
    const merged = mergeLivrosDestaqueEAdmin(livrosDestaque, livrosAdmin);
    const m = new Map<string, ILivro>();
    merged.forEach(l => m.set(l.uuid, l));
    return m;
  }, [livrosDestaque, livrosAdmin]);

  useEffect(() => {
    if (user?.uuid && enderecos.length === 0) {
      dispatch(fetchPerfilCompleto(user.uuid));
    }
  }, [dispatch, user?.uuid, enderecos.length]);

  const obterTituloItem = useCallback((item: IItemPedido) => 
    item.titulo || livrosMap.get(item.livroUuid)?.titulo || item.livroUuid, 
  [livrosMap]);

  const formatarMoeda = (n: number) => `R$ ${n.toFixed(2).replace('.', ',')}`;

  if (isLoading) return <LoadingState message="Carregando seus pedidos..." />;
  if (hasError) return <ErrorState message="Não foi possível carregar seus pedidos." />;

  return (
    <div className={styles.container}>
      <h1 className="page-title">Meus Pedidos</h1>

      <div className={styles.filtrosBar}>
        <div className={styles.stepper} data-cy="pedidos-tabs">
          {[
            { id: 'todos', label: 'Todos', index: 1 },
            { id: 'aberto', label: 'Em aberto', index: 2 },
            { id: 'finalizados', label: 'Finalizados', index: 3 }
          ].map((aba, i, arr) => (
            <React.Fragment key={aba.id}>
              <button
                type="button"
                className={`${styles.stepperStep} ${abaAtiva === aba.id ? styles.stepperStepAtiva : ''}`}
                onClick={() => alterarAba(aba.id as any)}
              >
                <span className={styles.stepperIndex}>{aba.index}</span>
                {aba.label}
              </button>
              {i < arr.length - 1 && <span className={styles.stepperConnector} />}
            </React.Fragment>
          ))}
        </div>

        <div className={styles.chipsBlock}>
          <p className={styles.chipsLabel}>Filtrar por status</p>
          <div className={styles.chipsRow} data-cy="pedidos-filtro-status">
            <button
              type="button"
              className={`${styles.chip} ${statusAtivo === '' ? styles.chipAtivo : ''}`}
              onClick={() => alterarStatusFiltro('')}
            >
              Todos os status
            </button>
            {opcoesStatusDisponiveis.map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.chip} ${statusAtivo === s ? styles.chipAtivo : ''}`}
                onClick={() => alterarStatusFiltro(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {pedidosFiltrados.length === 0 && <EmptyState message="Nenhum pedido encontrado para este filtro." />}

      <div className={styles.lista} data-cy="pedidos-lista">
        {pedidosFiltrados.map((pedido) => (
          <CartaoResumoPedido
            key={pedido.uuid}
            pedido={pedido}
            livrosMap={livrosMap}
            onVerDetalhes={setModalDetalhes}
            onRastrear={setModalRastrear}
            onSolicitarTroca={(uuid) => navigate(`/pedidos/${uuid}/troca`)}
          />
        ))}
      </div>

      <Modal isOpen={!!modalRastrear} onClose={() => setModalRastrear(null)} title="Acompanhar entrega">
        {modalRastrear && (
          <div className={styles.modalTexto}>
            <p><strong>Pedido </strong><span className={styles.pedidoUuid}>{modalRastrear.uuid}</span></p>
            <p>Status atual: {modalRastrear.status}</p>
            <p>{modalRastrear.status === 'Preparando' 
              ? 'Seu pedido está sendo preparado para envio. O código de rastreamento será integrado em breve.' 
              : 'Acompanhe as atualizações de status aqui. Integração com rastreio disponível em versão futura.'}</p>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!modalDetalhes} onClose={() => setModalDetalhes(null)} title="Detalhes do pedido" variant="large">
        {modalDetalhes && (
          <div className={styles.modalDetalhes}>
            <p><strong>Pedido </strong><span className={styles.pedidoUuid}>{modalDetalhes.uuid}</span></p>
            <p className={styles.modalDataLinha}>Data: {new Date(modalDetalhes.data).toLocaleString('pt-BR')}</p>
            <table className={styles.modalResumoTable}>
              <tbody>
                <tr><th className={styles.modalResumoLabel}>Status</th><td className={styles.modalResumoValor}>{modalDetalhes.status}</td></tr>
                {modalDetalhes.itens.map((item, idx) => (
                  <tr key={idx}>
                    {idx === 0 && <th rowSpan={modalDetalhes.itens.length} className={styles.modalResumoLabel}>Itens</th>}
                    <td className={styles.modalResumoValor}>{obterTituloItem(item)} — {item.quantidade} un × {formatarMoeda(item.precoUnitario)}</td>
                  </tr>
                ))}
                <tr><th className={styles.modalResumoLabel}>Total</th><td className={styles.modalResumoTotal}>{formatarMoeda(modalDetalhes.total)}</td></tr>
              </tbody>
            </table>
            {modalDetalhes.formaPagamento?.length ? (
              <>
                <h3 className={styles.modalSecaoTitulo}>Pagamento</h3>
                <ul className={styles.modalListaItens}>
                  {modalDetalhes.formaPagamento.map((fp, i) => (
                    <li key={i}>{fp.tipo === 'cartao' ? `Cartão ${fp.bandeira || ''} final ${fp.cartaoFinal || '—'}` : `Cupom ${fp.codigo || '—'}`} — {formatarMoeda(fp.valor)}</li>
                  ))}
                </ul>
              </>
            ) : null}
            <h3 className={styles.modalSecaoTitulo}>Entrega</h3>
            {(() => {
              const end = modalDetalhes.enderecoUuid ? enderecos.find(e => e.uuid === modalDetalhes.enderecoUuid) : null;
              return end ? <p>{end.logradouro}, {end.numero} — {end.bairro}, {end.cidade}/{end.estado} — CEP {end.cep}</p> : <p className={styles.modalMuted}>Endereço não disponível.</p>;
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};
