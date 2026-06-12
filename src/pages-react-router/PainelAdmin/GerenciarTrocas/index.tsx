'use client';

import { useMemo, useState, useEffect } from 'react';
import { usePedidosTrocaAdmin } from '../../../hooks/usePedidos';
import { useAppSelector } from '../../../store/hooks';
import { LoadingState } from '../../../components/Comum/LoadingState/LoadingState.tsx';
import { EmptyState } from '../../../components/Comum/EmptyState/EmptyState.tsx';
import { ErrorState } from '../../../components/Comum/ErrorState/ErrorState.tsx';
import { Modal } from '../../../components/Comum/Modal';
import type { IPedido } from '../../../interfaces/pedido';
import styles from './style.module.css';
import { mergeLivrosDestaqueEAdmin } from '../../../utils/livrosLookup';
import { LivroServiceApi } from '../../../services/api/livroServiceApi';
import {
  getStatusCssClass,
  isTrocaEmAndamento,
  isDevolucaoEmAndamento,
  isTrocaAutorizada,
  isDevolucaoAutorizada,
  isConcluido,
  isDevolucao,
} from '../../../utils/statusPedidoUtils';

interface ItensSelecionadosState {
  [pedidoUuid: string]: Set<string>;
}

function GerenciarTrocas() {
  const { pedidos, loading, error, autorizarTroca, rejeitarTroca, confirmarRecebimento, autorizarDevolucao, rejeitarDevolucao, confirmarRecebimentoDevolucao } = usePedidosTrocaAdmin();
  const livrosDestaque = useAppSelector((state) => state.livro.livrosDestaque);
  const livrosAdmin = useAppSelector((state) => state.livro.livrosAdmin);
  const livrosParaTitulo = useMemo(
    () => mergeLivrosDestaqueEAdmin(livrosDestaque, livrosAdmin),
    [livrosDestaque, livrosAdmin],
  );

  const [modalConfirmar, setModalConfirmar] = useState<IPedido | null>(null);
  const [modalRejeitar, setModalRejeitar] = useState<IPedido | null>(null);
  const [modalDetalhesItem, setModalDetalhesItem] = useState<any>(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
  const [retornarEstoque, setRetornarEstoque] = useState(true);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [processando, setProcessando] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [itensSelecionados, setItensSelecionados] = useState<ItensSelecionadosState>({});

  useEffect(() => {
    pedidos.forEach((pedido) => {
      inicializarItensSelecionados(pedido);
    });
  }, [pedidos]);

  if (loading) {
    return (
      <div className={styles.container} data-cy="trocas-painel">
        <LoadingState message="Carregando solicitações de troca..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className={styles.container} data-cy="trocas-painel">
        <ErrorState message={error} />
      </div>
    );
  }
  if (pedidos.length === 0) {
    return (
      <div className={styles.container} data-cy="trocas-painel">
        <EmptyState message="Nenhuma solicitação de troca encontrada." />
      </div>
    );
  }

  const getLivroTitulo = (livroUuid: string): string => {
    const livro = livrosParaTitulo.find((l) => l.uuid === livroUuid);
    return livro?.titulo || livroUuid;
  };

  const getLivroDetalhes = (livroUuid: string) => {
    return livrosParaTitulo.find((l) => l.uuid === livroUuid);
  };

  const handleVerDetalhesItem = async (livroUuid: string) => {
    // Primeiro tenta buscar no Redux state
    const livroNoState = getLivroDetalhes(livroUuid);
    
    if (livroNoState) {
      setModalDetalhesItem(livroNoState);
      return;
    }

    // Se não encontrar no state, busca via API
    setCarregandoDetalhes(true);
    setModalDetalhesItem(null);
    
    try {
      const livroService = new LivroServiceApi();
      const livro = await livroService.getDetalhes(livroUuid);
      setModalDetalhesItem(livro);
    } catch (error) {
      console.error('Erro ao buscar detalhes do livro:', error);
      setModalDetalhesItem(null);
    } finally {
      setCarregandoDetalhes(false);
    }
  };

  const toggleItemSelecionado = (pedidoUuid: string, itemUuid: string, podeSelecionar: boolean) => {
    if (!podeSelecionar) return;

    setItensSelecionados((prev) => {
      const current = new Set(prev[pedidoUuid] || []);
      if (current.has(itemUuid)) {
        current.delete(itemUuid);
      } else {
        current.add(itemUuid);
      }
      return { ...prev, [pedidoUuid]: current };
    });
  };

  const inicializarItensSelecionados = (pedido: IPedido) => {
    const itensEmTroca = pedido.itens.filter((item) => item.emTroca).map((item) => item.uuid || item.livroUuid);
    setItensSelecionados((prev) => ({
      ...prev,
      [pedido.uuid]: new Set(itensEmTroca),
    }));
  };

  const handleAutorizar = async (pedidoUuid: string) => {
    setProcessando(true);
    try {
      await autorizarTroca(pedidoUuid);
      setFeedbackMsg(`Troca do pedido #${pedidoUuid?.split('-')[1] || pedidoUuid} autorizada.`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao autorizar troca';
      setFeedbackMsg(`Erro: ${msg}`);
    } finally {
      setProcessando(false);
    }
  };

  const handleRejeitar = async () => {
    if (!modalRejeitar) return;
    setProcessando(true);
    try {
      const isDevolucaoStatus = isDevolucao(modalRejeitar.status);
      if (isDevolucaoStatus) {
        await rejeitarDevolucao(modalRejeitar.uuid, motivoRejeicao);
      } else {
        await rejeitarTroca(modalRejeitar.uuid, motivoRejeicao);
      }
      const tipo = isDevolucaoStatus ? 'Devolução' : 'Troca';
      setFeedbackMsg(`${tipo} do pedido #${modalRejeitar.uuid?.split('-')[1] || modalRejeitar.uuid} rejeitada.`);
      setModalRejeitar(null);
      setMotivoRejeicao('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao rejeitar troca';
      setFeedbackMsg(`Erro: ${msg}`);
    } finally {
      setProcessando(false);
    }
  };

  const handleConfirmarRecebimento = async () => {
    if (!modalConfirmar) return;
    setProcessando(true);
    try {
      // Verifica se é devolução ou troca pelo status usando utilitário centralizado
      const isDevolucaoStatus = isDevolucao(modalConfirmar.status);
      const resultado = isDevolucaoStatus
        ? await confirmarRecebimentoDevolucao(modalConfirmar.uuid, retornarEstoque)
        : await confirmarRecebimento(modalConfirmar.uuid, retornarEstoque);
      const pedidoId = modalConfirmar.uuid?.split('-')[1] || modalConfirmar.uuid;
      
      // Type guard para verificar se o resultado tem cupomGerado
      const cupomGerado = 'cupomGerado' in resultado ? resultado.cupomGerado : null;
      const cupomInfo = cupomGerado
        ? ` Cupom de ${isDevolucaoStatus ? 'devolução' : 'troca'} gerado: ${cupomGerado.codigo} (R$ ${Number(cupomGerado.valor ?? 0).toFixed(2).replace('.', ',')})`
        : '';
      setFeedbackMsg(`Recebimento do pedido #${pedidoId} confirmado.${cupomInfo}`);
      setModalConfirmar(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao confirmar recebimento';
      setFeedbackMsg(`Erro: ${msg}`);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className={styles.container} data-cy="trocas-painel">
      <div className={styles.headerSection}>
        <h2>Gerenciar Trocas / Devoluções</h2>
        <span className={styles.contador}>{pedidos.length} solicitação(ões)</span>
      </div>

      {feedbackMsg && (
        <div className={styles.feedbackBanner} data-cy="feedback-banner">
          <span>{feedbackMsg}</span>
          <button type="button" className={styles.fecharFeedback} onClick={() => setFeedbackMsg('')}>
            ×
          </button>
        </div>
      )}

      <div className={styles.tabelaWrapper}>
        <table className={styles.tabela} data-cy="admin-trocas-tabela">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Data</th>
              <th>Itens</th>
              <th>Motivo</th>
              <th>Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.uuid} data-cy={`admin-troca-${pedido.uuid}`}>
                <td className={styles.colPedido}>#{pedido.uuid?.split('-')[1] || pedido.uuid}</td>
                <td>{new Date(pedido.data).toLocaleDateString('pt-BR')}</td>
                <td>
                  {pedido.itens.map((item, idx) => {
                    const itemKey = item.uuid || item.livroUuid;
                    const isSelected = itensSelecionados[pedido.uuid]?.has(itemKey) || false;
                    const podeSelecionar = item.emTroca === true;

                    return (
                      <div key={`${item.livroUuid}-${idx}`} className={styles.itemNome}>
                        <label className={styles.itemCheckboxLabel}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!podeSelecionar}
                            onChange={() => toggleItemSelecionado(pedido.uuid, itemKey, podeSelecionar)}
                            data-cy={`item-checkbox-${itemKey}`}
                          />
                          <button
                            type="button"
                            className={styles.itemLink}
                            onClick={() => handleVerDetalhesItem(item.livroUuid)}
                            data-cy={`item-detalhes-${item.livroUuid}`}
                          >
                            {getLivroTitulo(item.livroUuid)}
                          </button>
                          <span> (x{item.quantidade})</span>
                          {item.emTroca && <span className={styles.itemEmTrocaBadge}>Em Troca</span>}
                        </label>
                      </div>
                    );
                  })}
                </td>
                <td className={styles.colMotivo}>
                  {pedido.motivo || '—'}
                </td>
                <td className={styles.colTotal}>
                  R$ {(pedido.total ?? 0).toFixed(2).replace('.', ',')}
                </td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${styles[getStatusCssClass(pedido.status)]}`}
                    data-cy="pedido-status"
                  >
                    {pedido.status}
                  </span>
                </td>
                <td className={styles.colAcoes}>
                  {isTrocaEmAndamento(pedido.status) && (
                    <>
                      <button
                        className={`btn-primary ${styles.btnAcao}`}
                        onClick={() => handleAutorizar(pedido.uuid)}
                        disabled={processando}
                        data-cy={`btn-autorizar-troca-${pedido.uuid}`}
                      >
                        Autorizar
                      </button>
                      <button
                        className={`btn-secondary ${styles.btnAcao}`}
                        onClick={() => {
                          setModalRejeitar(pedido);
                          setMotivoRejeicao('');
                          inicializarItensSelecionados(pedido);
                        }}
                        disabled={processando}
                        data-cy={`btn-rejeitar-troca-${pedido.uuid}`}
                      >
                        Rejeitar
                      </button>
                    </>
                  )}
                  {isDevolucaoEmAndamento(pedido.status) && (
                    <>
                      <button
                        className={`btn-primary ${styles.btnAcao}`}
                        onClick={() => autorizarDevolucao(pedido.uuid)}
                        disabled={processando}
                        data-cy={`btn-autorizar-devolucao-${pedido.uuid}`}
                      >
                        Autorizar Devolução
                      </button>
                      <button
                        className={`btn-secondary ${styles.btnAcao}`}
                        onClick={() => {
                          setModalRejeitar(pedido);
                          setMotivoRejeicao('');
                          inicializarItensSelecionados(pedido);
                        }}
                        disabled={processando}
                        data-cy={`btn-rejeitar-devolucao-${pedido.uuid}`}
                      >
                        Rejeitar
                      </button>
                    </>
                  )}
                  {(isTrocaAutorizada(pedido.status) || isDevolucaoAutorizada(pedido.status)) && (
                    <button
                      className={`btn-secondary ${styles.btnAcao}`}
                      onClick={() => {
                        setModalConfirmar(pedido);
                        setRetornarEstoque(true);
                      }}
                      disabled={processando}
                      data-cy={`btn-confirmar-recebimento-${pedido.uuid}`}
                    >
                      Confirmar Recebimento
                    </button>
                  )}
                  {isConcluido(pedido.status) && (
                    <span className={styles.concluido}>✅ Concluído</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes do Item */}
      <Modal
        isOpen={modalDetalhesItem !== null || carregandoDetalhes}
        title="Detalhes do Item"
        onClose={() => {
          setModalDetalhesItem(null);
          setCarregandoDetalhes(false);
        }}
      >
        {carregandoDetalhes ? (
          <div className={styles.modalContent}>
            <LoadingState message="Carregando detalhes do livro..." />
          </div>
        ) : modalDetalhesItem ? (
          <div className={styles.modalContent}>
            <div className={styles.detalhesItem}>
              <h3>{modalDetalhesItem.titulo || 'Detalhes do Item'}</h3>
              <p><strong>UUID do Livro:</strong> {modalDetalhesItem.uuid || 'N/A'}</p>
              <p><strong>Autor:</strong> {modalDetalhesItem.autor || 'N/A'}</p>
              <p><strong>Categoria:</strong> {modalDetalhesItem.categoria || 'N/A'}</p>
              <p><strong>Preço:</strong> R$ {(modalDetalhesItem.preco ?? 0).toFixed(2).replace('.', ',')}</p>
              <p><strong>Descrição:</strong> {modalDetalhesItem.descricao || 'N/A'}</p>
            </div>
            <div className={styles.modalAcoes}>
              <button
                className="btn-secondary"
                onClick={() => setModalDetalhesItem(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.modalContent}>
            <div className={styles.detalhesItem}>
              <p style={{ color: '#c62828', marginTop: '12px' }}>
                ⚠️ Detalhes completos do livro não disponíveis no catálogo atual.
              </p>
            </div>
            <div className={styles.modalAcoes}>
              <button
                className="btn-secondary"
                onClick={() => setModalDetalhesItem(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmação de Recebimento (RF0043 / RF0054) */}
      <Modal
        isOpen={modalConfirmar !== null}
        title="Confirmar Recebimento de Troca"
        onClose={() => setModalConfirmar(null)}
      >
        {modalConfirmar && (
          <div className={styles.modalContent}>
            <p>
              Confirmar recebimento dos itens do pedido{' '}
              <strong>#{modalConfirmar.uuid?.split('-')[1] || modalConfirmar.uuid}</strong>?
            </p>

            <div className={styles.modalItens}>
              {modalConfirmar.itens.map((item, idx) => {
                const itemKey = item.uuid || item.livroUuid;
                const isSelected = itensSelecionados[modalConfirmar.uuid]?.has(itemKey) || false;
                const podeSelecionar = item.emTroca === true;

                return (
                  <div key={`${item.livroUuid}-${idx}`} className={styles.modalItem}>
                    <label className={styles.itemCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!podeSelecionar}
                        onChange={() => toggleItemSelecionado(modalConfirmar.uuid, itemKey, podeSelecionar)}
                        data-cy={`modal-item-checkbox-${itemKey}`}
                      />
                      <span className={podeSelecionar ? '' : styles.itemDisabled}>
                        {getLivroTitulo(item.livroUuid)}
                      </span>
                      <span>x{item.quantidade}</span>
                      {item.emTroca && <span className={styles.itemEmTrocaBadge}>Em Troca</span>}
                    </label>
                  </div>
                );
              })}
            </div>

            <div className={styles.estoqueOption}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={retornarEstoque}
                  onChange={(e) => setRetornarEstoque(e.target.checked)}
                  data-cy="checkbox-retornar-estoque"
                />
                <span>Retornar itens ao estoque (RF0054)</span>
              </label>
            </div>

            <p className={styles.modalInfo}>
              ⚡ Um <strong>cupom de troca</strong> no valor de{' '}
              <strong>R$ {(modalConfirmar.total ?? 0).toFixed(2).replace('.', ',')}</strong>{' '}
              será gerado automaticamente para o cliente (RF0044).
            </p>

            <div className={styles.modalAcoes}>
              <button
                className="btn-secondary"
                onClick={() => setModalConfirmar(null)}
                data-cy="btn-cancelar-modal"
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleConfirmarRecebimento}
                disabled={processando}
                data-cy="btn-confirmar-modal"
              >
                {processando ? 'Processando...' : 'Confirmar e Gerar Cupom'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Rejeição de Troca */}
      <Modal
        isOpen={modalRejeitar !== null}
        title="Rejeitar Solicitação de Troca"
        onClose={() => {
          setModalRejeitar(null);
          setMotivoRejeicao('');
        }}
      >
        {modalRejeitar && (
          <div className={styles.modalContent}>
            <p>
              Rejeitar solicitação de troca do pedido{' '}
              <strong>#{modalRejeitar.uuid?.split('-')[1] || modalRejeitar.uuid}</strong>?
            </p>

            <div className={styles.modalItens}>
              {modalRejeitar.itens.map((item, idx) => {
                const itemKey = item.uuid || item.livroUuid;
                const isSelected = itensSelecionados[modalRejeitar.uuid]?.has(itemKey) || false;
                const podeSelecionar = item.emTroca === true;

                return (
                  <div key={`${item.livroUuid}-${idx}`} className={styles.modalItem}>
                    <label className={styles.itemCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!podeSelecionar}
                        onChange={() => toggleItemSelecionado(modalRejeitar.uuid, itemKey, podeSelecionar)}
                        data-cy={`modal-item-checkbox-${itemKey}`}
                      />
                      <span className={podeSelecionar ? '' : styles.itemDisabled}>
                        {getLivroTitulo(item.livroUuid)}
                      </span>
                      <span>x{item.quantidade}</span>
                      {item.emTroca && <span className={styles.itemEmTrocaBadge}>Em Troca</span>}
                    </label>
                  </div>
                );
              })}
            </div>

            <div className={styles.motivoContainer}>
              <label className={styles.label} htmlFor="motivo-rejeicao">
                Motivo da rejeição <span className={styles.required}>*</span>
              </label>
              <textarea
                id="motivo-rejeicao"
                className={styles.textarea}
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                placeholder="Descreva o motivo da rejeição (ex: produto danificado, fora do prazo, etc.)"
                rows={4}
                data-cy="troca-motivo-rejeicao"
              />
            </div>

            <div className={styles.modalAcoes}>
              <button
                className="btn-secondary"
                onClick={() => {
                  setModalRejeitar(null);
                  setMotivoRejeicao('');
                }}
                data-cy="btn-cancelar-rejeicao"
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleRejeitar}
                disabled={processando || !motivoRejeicao.trim()}
                data-cy="btn-confirmar-rejeicao"
              >
                {processando ? 'Processando...' : 'Rejeitar Troca'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default GerenciarTrocas;
export { GerenciarTrocas };
