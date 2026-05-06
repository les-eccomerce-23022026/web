'use client';

import { useMemo, useState } from 'react';
import { usePedidosTrocaAdmin } from '../../../hooks/usePedidos';
import { useAppSelector } from '../../../store/hooks';
import { LoadingState } from '../../../components/Comum/LoadingState/LoadingState.tsx';
import { EmptyState } from '../../../components/Comum/EmptyState/EmptyState.tsx';
import { ErrorState } from '../../../components/Comum/ErrorState/ErrorState.tsx';
import { Modal } from '../../../components/Comum/Modal';
import type { IPedido } from '../../../interfaces/pedido';
import styles from './style.module.css';
import { mergeLivrosDestaqueEAdmin } from '../../../utils/livrosLookup';

function GerenciarTrocas() {
  const { pedidos, loading, error, autorizarTroca, rejeitarTroca, confirmarRecebimento } = usePedidosTrocaAdmin();
  const livrosDestaque = useAppSelector((state) => state.livro.livrosDestaque);
  const livrosAdmin = useAppSelector((state) => state.livro.livrosAdmin);
  const livrosParaTitulo = useMemo(
    () => mergeLivrosDestaqueEAdmin(livrosDestaque, livrosAdmin),
    [livrosDestaque, livrosAdmin],
  );

  const [modalConfirmar, setModalConfirmar] = useState<IPedido | null>(null);
  const [modalRejeitar, setModalRejeitar] = useState<IPedido | null>(null);
  const [retornarEstoque, setRetornarEstoque] = useState(true);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [processando, setProcessando] = useState(false);

  if (loading) return <LoadingState message="Carregando solicitações de troca..." />;
  if (error) return <ErrorState message={error} />;
  if (pedidos.length === 0) {
    return <EmptyState message="Nenhuma solicitação de troca encontrada." />;
  }

  const getLivroTitulo = (livroUuid: string): string => {
    const livro = livrosParaTitulo.find((l) => l.uuid === livroUuid);
    return livro?.titulo || livroUuid;
  };

  const handleAutorizar = async (pedidoUuid: string) => {
    setProcessando(true);
    try {
      await autorizarTroca(pedidoUuid);
    } finally {
      setProcessando(false);
    }
  };

  const handleRejeitar = async () => {
    if (!modalRejeitar) return;
    setProcessando(true);
    try {
      await rejeitarTroca(modalRejeitar.uuid, motivoRejeicao);
      setModalRejeitar(null);
      setMotivoRejeicao('');
    } finally {
      setProcessando(false);
    }
  };

  const handleConfirmarRecebimento = async () => {
    if (!modalConfirmar) return;
    setProcessando(true);
    try {
      await confirmarRecebimento(modalConfirmar.uuid, retornarEstoque);
      setModalConfirmar(null);
    } finally {
      setProcessando(false);
    }
  };

  const getStatusClass = (status: string): string => {
    const map: Record<string, string> = {
      'Em Troca': styles.statusEmTroca,
      'Troca Autorizada': styles.statusTrocaAutorizada,
      'Trocado': styles.statusTrocado,
    };
    return map[status] || '';
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h2>Gerenciar Trocas / Devoluções</h2>
        <span className={styles.contador}>{pedidos.length} solicitação(ões)</span>
      </div>

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
                <td className={styles.colPedido}>#{pedido.uuid.split('-')[1]}</td>
                <td>{new Date(pedido.data).toLocaleDateString('pt-BR')}</td>
                <td>
                  {pedido.itens.map((item) => (
                    <div key={item.livroUuid} className={styles.itemNome}>
                      {getLivroTitulo(item.livroUuid)} (x{item.quantidade})
                    </div>
                  ))}
                </td>
                <td className={styles.colMotivo}>
                  {pedido.motivo || '—'}
                </td>
                <td className={styles.colTotal}>
                  R$ {pedido.total.toFixed(2).replace('.', ',')}
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(pedido.status)}`}>
                    {pedido.status}
                  </span>
                </td>
                <td className={styles.colAcoes}>
                  {pedido.status === 'Em Troca' && (
                    <>
                      <button
                        className={`btn-primary ${styles.btnAcao}`}
                        onClick={() => handleAutorizar(pedido.uuid)}
                        disabled={processando}
                        data-cy={`btn-autorizar-${pedido.uuid}`}
                      >
                        Autorizar
                      </button>
                      <button
                        className={`btn-secondary ${styles.btnAcao}`}
                        onClick={() => {
                          setModalRejeitar(pedido);
                          setMotivoRejeicao('');
                        }}
                        disabled={processando}
                        data-cy={`btn-rejeitar-${pedido.uuid}`}
                      >
                        Rejeitar
                      </button>
                    </>
                  )}
                  {pedido.status === 'Troca Autorizada' && (
                    <button
                      className={`btn-secondary ${styles.btnAcao}`}
                      onClick={() => {
                        setModalConfirmar(pedido);
                        setRetornarEstoque(true);
                      }}
                      disabled={processando}
                      data-cy={`btn-confirmar-${pedido.uuid}`}
                    >
                      Confirmar Recebimento
                    </button>
                  )}
                  {pedido.status === 'Trocado' && (
                    <span className={styles.concluido}>✅ Concluído</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
              <strong>#{modalConfirmar.uuid.split('-')[1]}</strong>?
            </p>

            <div className={styles.modalItens}>
              {modalConfirmar.itens.map((item) => (
                <div key={item.livroUuid} className={styles.modalItem}>
                  <span>{getLivroTitulo(item.livroUuid)}</span>
                  <span>x{item.quantidade}</span>
                </div>
              ))}
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
              <strong>R$ {modalConfirmar.total.toFixed(2).replace('.', ',')}</strong>{' '}
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
              <strong>#{modalRejeitar.uuid.split('-')[1]}</strong>?
            </p>

            <div className={styles.modalItens}>
              {modalRejeitar.itens.map((item) => (
                <div key={item.livroUuid} className={styles.modalItem}>
                  <span>{getLivroTitulo(item.livroUuid)}</span>
                  <span>x{item.quantidade}</span>
                </div>
              ))}
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
                data-cy="motivo-rejeicao-input"
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
