import { Modal } from '@/components/Comum/Modal/Modal';
import type { IPedido } from '@/interfaces/pedido';
import type { ILivro } from '@/interfaces/livro';
import type { IEnderecoCliente } from '@/interfaces/pagamento';
import { formatMoeda, tituloItem } from './meusPedidosHelpers';
import styles from './MeusPedidos.module.css';

type Props = {
  pedido: IPedido | null;
  livrosMap: Map<string, ILivro>;
  enderecoPedido: (p: IPedido) => IEnderecoCliente | undefined;
  onClose: () => void;
};

export const ModalDetalhesPedido = ({
  pedido,
  livrosMap,
  enderecoPedido,
  onClose,
}: Props) => {
  return (
    <Modal
      isOpen={!!pedido}
      onClose={onClose}
      title="Detalhes do pedido"
      variant="large"
      footer={
        <button
          type="button"
          className="btn-secondary"
          onClick={onClose}
        >
          Fechar
        </button>
      }
    >
      {pedido && (
        <div className={styles.modalDetalhes}>
          <p>
            <strong>Pedido </strong>
            <span className={styles.pedidoUuid}>{pedido.uuid}</span>
          </p>
          <p className={styles.modalDataLinha}>
            Data:{' '}
            {new Date(pedido.data).toLocaleString('pt-BR', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </p>

          <table className={styles.modalResumoTable}>
            <tbody>
              <tr>
                <th scope="row" className={styles.modalResumoLabel}>
                  Status
                </th>
                <td className={styles.modalResumoValor}>
                  {pedido.status}
                </td>
              </tr>
              {pedido.itens.map((item, idx) => (
                <tr key={`${item.livroUuid}-${idx}`}>
                  {idx === 0 ? (
                    <th
                      scope="row"
                      rowSpan={pedido.itens.length}
                      className={styles.modalResumoLabel}
                    >
                      Itens
                    </th>
                  ) : null}
                  <td className={styles.modalResumoValor}>
                    {tituloItem(item, livrosMap)} — {item.quantidade}{' '}
                    {item.quantidade === 1 ? 'unidade' : 'unidades'} ×{' '}
                    {formatMoeda(item.precoUnitario)}
                  </td>
                </tr>
              ))}
              <tr>
                <th scope="row" className={styles.modalResumoLabel}>
                  Total
                </th>
                <td className={styles.modalResumoTotal}>
                  {formatMoeda(pedido.total)}
                </td>
              </tr>
            </tbody>
          </table>

          {pedido.formaPagamento &&
            pedido.formaPagamento.length > 0 && (
              <>
                <h3 className={styles.modalSecaoTitulo}>Pagamento</h3>
                <ul className={styles.modalListaItens}>
                  {pedido.formaPagamento.map((fp, i) => (
                    <li key={i}>
                      {fp.tipo === 'cartao' ? (
                        <>
                          Cartão {fp.bandeira ?? ''} final{' '}
                          {fp.cartaoFinal ?? '—'} — {formatMoeda(fp.valor)}
                        </>
                      ) : (
                        <>
                          Cupom {fp.codigo ?? '—'} — {formatMoeda(fp.valor)}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

          <h3 className={styles.modalSecaoTitulo}>Entrega</h3>
          {(() => {
            const end = enderecoPedido(pedido);
            if (end) {
              return (
                <p className={styles.modalEndereco}>
                  {end.logradouro}, {end.numero}
                  {end.complemento ? ` — ${end.complemento}` : ''} —{' '}
                  {end.bairro}, {end.cidade}/{end.estado} — CEP {end.cep}
                </p>
              );
            }
            return (
              <p className={styles.modalMuted}>
                Endereço de entrega não está disponível nesta visualização.
                Confira o e-mail de confirmação da compra ou atualize seu
                perfil.
              </p>
            );
          })()}

          <p className={styles.modalMuted}>
            Nota fiscal: disponibilizada por e-mail após o faturamento, quando
            aplicável.
          </p>
        </div>
      )}
    </Modal>
  );
};
