import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { solicitarTrocaThunk } from '@/store/slices/pedidoSlice';
import { LoadingState } from '@/components/comum/LoadingState/LoadingState';
import { ErrorState } from '@/components/comum/ErrorState/ErrorState';
import type { IItemPedido } from '@/interfaces/IPedido';
import styles from './SolicitarTroca.module.css';

export function SolicitarTroca() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { pedidos } = useAppSelector((state) => state.pedido);
  const livrosState = useAppSelector((state) => state.livro);

  const [itensSelecionados, setItensSelecionados] = useState<string[]>([]);
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const pedido = pedidos.find((p) => p.uuid === uuid);

  if (!pedido) return <ErrorState message="Pedido não encontrado." />;
  if (pedido.status !== 'Entregue') {
    return <ErrorState message="Apenas pedidos com status 'Entregue' podem ser trocados (RN0043)." />;
  }

  const getLivroTitulo = (livroUuid: string): string => {
    const livro = livrosState.livros.find((l) => l.uuid === livroUuid);
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
    if (motivo.trim().length < 10) {
      setErro('O motivo deve ter pelo menos 10 caracteres.');
      return;
    }

    setErro('');
    setEnviando(true);

    try {
      await dispatch(solicitarTrocaThunk({
        pedidoUuid: pedido.uuid,
        motivo,
        itensUuids: itensSelecionados,
      })).unwrap();
      setSucesso(true);
    } catch {
      setErro('Erro ao solicitar troca. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  if (sucesso) {
    return (
      <div className={styles.container}>
        <div className={`card ${styles.sucessoCard}`}>
          <div className={styles.sucessoIcon}>✅</div>
          <h2>Solicitação de Troca Enviada!</h2>
          <p>
            Seu pedido <strong>#{pedido.uuid.split('-')[1]}</strong> foi encaminhado para análise.
            Você será notificado quando a troca for autorizada.
          </p>
          <button
            className="btn-primary"
            onClick={() => navigate('/pedidos')}
            data-cy="btn-voltar-pedidos"
          >
            Voltar para Meus Pedidos
          </button>
        </div>
      </div>
    );
  }

  if (enviando) return <LoadingState message="Enviando solicitação de troca..." />;

  return (
    <div className={styles.container}>
      <h1 className="page-title">Solicitar Troca</h1>
      <p className={styles.subtitulo}>
        Pedido #{pedido.uuid.split('-')[1]} — {new Date(pedido.data).toLocaleDateString('pt-BR')}
      </p>

      {erro && <div className={styles.erroMessage} data-cy="troca-erro">{erro}</div>}

      <div className={`card ${styles.secao}`}>
        <h3>Selecione os itens para troca</h3>
        <p className={styles.dica}>Marque os itens que deseja trocar.</p>
        <div className={styles.itensLista} data-cy="troca-itens-lista">
          {pedido.itens.map((item: IItemPedido) => (
            <label
              key={item.livroUuid}
              className={`${styles.itemCheckbox} ${itensSelecionados.includes(item.livroUuid) ? styles.itemSelecionado : ''}`}
              data-cy={`troca-item-${item.livroUuid}`}
            >
              <input
                type="checkbox"
                checked={itensSelecionados.includes(item.livroUuid)}
                onChange={() => toggleItem(item.livroUuid)}
              />
              <div className={styles.itemInfo}>
                <span className={styles.itemTitulo}>{getLivroTitulo(item.livroUuid)}</span>
                <span className={styles.itemDetalhes}>
                  Qtd: {item.quantidade} — R$ {item.precoUnitario.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className={`card ${styles.secao}`}>
        <h3>Motivo da Troca</h3>
        <div className="form-group">
          <textarea
            className={styles.motivoTextarea}
            placeholder="Descreva o motivo da troca (mínimo 10 caracteres)..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={4}
            data-cy="troca-motivo"
          />
        </div>
      </div>

      <div className={styles.resumoTroca}>
        <div className={styles.resumoInfo}>
          <span>Itens selecionados: <strong>{itensSelecionados.length}</strong></span>
          <span>
            Valor estimado do cupom:{' '}
            <strong className={styles.valorCupom}>
              R$ {pedido.itens
                .filter((item) => itensSelecionados.includes(item.livroUuid))
                .reduce((acc, item) => acc + item.precoUnitario * item.quantidade, 0)
                .toFixed(2)
                .replace('.', ',')}
            </strong>
          </span>
        </div>
      </div>

      <div className={styles.acoes}>
        <button
          className="btn-secondary"
          onClick={() => navigate('/pedidos')}
          data-cy="btn-cancelar-troca"
        >
          Cancelar
        </button>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={itensSelecionados.length === 0 || motivo.trim().length < 10}
          data-cy="btn-confirmar-troca"
        >
          Confirmar Solicitação de Troca
        </button>
      </div>
    </div>
  );
}
