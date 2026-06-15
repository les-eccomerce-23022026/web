import { useCallback, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCart, AlertTriangle } from 'lucide-react';
import styles from './style.module.css';
import { EmptyState } from '@/components/Comum/EmptyState/EmptyState.tsx';
import { Skeleton } from '@/components/Comum/Skeleton';
import { FreteCalculo, type FreteCalculoEntregaApi } from '@/components/FinalizarCompra/Entrega';
import { useEntrega } from '@/hooks/useEntrega';
import { useNotification } from '@/components/Comum/Notification/useNotification';
import type { IFreteOpcao } from '@/interfaces/entrega';
import type { IItemCarrinho } from '@/interfaces/carrinho';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  removerItem,
  atualizarQuantidade,
  sincronizarLinhaCarrinho,
  definirFreteResumoCarrinho,
  adicionarItensExpirados,
  limparItensExpirados,
  restaurarItemExpirado,
} from '@/store/slices/carrinhoSlice';
import {
  persistirCotacaoFreteCarrinho,
  limparCotacaoFreteCarrinho,
} from '@/store/slices/cotacaoFreteSlice';
import { assinaturaItensCarrinho } from '@/utils/carrinhoAssinatura';
import { USE_MOCK } from '@/config/apiConfig';
import { ROTAS } from '@/config/rotas';

export const Carrinho = () => {
  const dispatch = useAppDispatch();
  const { data, error, status, itensExpirados } = useAppSelector((state) => state.carrinho);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { showWarning } = useNotification();

  const usarCarrinhoLocal = USE_MOCK || !isAuthenticated;

  const entrega = useEntrega();
  const {
    freteSelecionado,
    selecionarFrete,
    calcularFrete,
    freteCalculado,
    loading: entregaLoading,
    error: entregaError,
    formatarCep,
    validarCep,
    limparFrete,
    cepDestino,
  } = entrega;

  const entregaParaFreteCalculo: FreteCalculoEntregaApi = useMemo(
    () => ({
      calcularFrete,
      freteCalculado,
      loading: entregaLoading,
      error: entregaError,
      formatarCep,
      validarCep,
    }),
    [calcularFrete, freteCalculado, entregaLoading, entregaError, formatarCep, validarCep],
  );

  const carrinhoAssinatura = useMemo(() => assinaturaItensCarrinho(data), [data]);

  const prevCarrinhoAssinaturaRef = useRef<string | null>(null);

  useEffect(() => {
    if (!carrinhoAssinatura) {
      prevCarrinhoAssinaturaRef.current = null;
      return;
    }
    if (prevCarrinhoAssinaturaRef.current === carrinhoAssinatura) return;
    if (prevCarrinhoAssinaturaRef.current !== null) {
      limparFrete();
      dispatch(limparCotacaoFreteCarrinho());
    }
    prevCarrinhoAssinaturaRef.current = carrinhoAssinatura;
  }, [carrinhoAssinatura, limparFrete, dispatch]);

  const prevItensExpiradosRef = useRef<IItemCarrinho[]>([]);

  useEffect(() => {
    if (itensExpirados.length > prevItensExpiradosRef.current.length) {
      const novosItens = itensExpirados.filter(
        (item) => !prevItensExpiradosRef.current.some((prev) => prev.uuid === item.uuid),
      );
      if (novosItens.length > 0) {
        const mensagem =
          novosItens.length === 1
            ? `O item "${novosItens[0].titulo}" foi removido por tempo expirado.`
            : `${novosItens.length} itens foram removidos por tempo expirado.`;
        showWarning(mensagem, 5000);
      }
    }
    prevItensExpiradosRef.current = itensExpirados;
  }, [itensExpirados, showWarning]);

  const handleFreteSelecionado = useCallback(
    (opcao: IFreteOpcao) => {
      selecionarFrete(opcao);
      dispatch(definirFreteResumoCarrinho({ frete: opcao.valor }));
      if (!data || !freteCalculado || !carrinhoAssinatura) return;
      dispatch(
        persistirCotacaoFreteCarrinho({
          opcaoSelecionada: opcao,
          freteCalculado,
          cepDestino: cepDestino.replace(/\D/g, ''),
          assinaturaItens: carrinhoAssinatura,
          subtotalCotado: data.resumo.subtotal,
        }),
      );
    },
    [
      dispatch,
      selecionarFrete,
      data,
      freteCalculado,
      carrinhoAssinatura,
      cepDestino,
    ],
  );

  if (status === 'loading') {
    return (
      <div className={styles['carrinho-page']}>
        <h1 className="page-title">Carrinho de Compras</h1>
        <hr className={styles['carrinho-separator']} />
        <div className={styles['carrinho-skeleton-container']}>
          <Skeleton variant="rectangular" height={100} className={styles['carrinho-skeleton-row']} />
          <Skeleton variant="rectangular" height={100} className={styles['carrinho-skeleton-row']} />
          <Skeleton variant="rectangular" height={100} className={styles['carrinho-skeleton-row']} />
        </div>
      </div>
    );
  }
  if (status === 'failed' || error) {
    return (
      <div className={styles['carrinho-page']}>
        <h1 className="page-title">Carrinho de Compras</h1>
        <hr className={styles['carrinho-separator']} />
        <p className={styles['carrinho-status-message']}>Erro ao carregar carrinho.</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className={styles['carrinho-page']}>
        <h1 className="page-title">Carrinho de Compras</h1>
        <hr className={styles['carrinho-separator']} />
        <div className={styles['carrinho-skeleton-container']}>
          <Skeleton variant="rectangular" height={100} className={styles['carrinho-skeleton-row']} />
          <Skeleton variant="rectangular" height={100} className={styles['carrinho-skeleton-row']} />
        </div>
      </div>
    );
  }
  if (data.itens.length === 0) {
    return (
      <div className={`${styles['carrinho-page']} page-transition-enter`} data-cy="carrinho-vazio">
        <h1 className="page-title">Carrinho de Compras</h1>
        <hr className={styles['carrinho-separator']} />

        <EmptyState
          title="Seu carrinho está vazio"
          message="Explore nosso catálogo e adicione livros que deseja levar para casa."
          icon={<ShoppingCart size={80} strokeWidth={1} color="var(--bn-primary)" />}
        />

        <div className={styles['carrinho-empty-actions']}>
          <Link href={ROTAS.HOME} className={styles['carrinho-empty-link']}>
            <button type="button" className={styles['carrinho-empty-cta']}>
              Continuar comprando
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdateQuantidade = (uuid: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const qtd = parseInt(event.target.value, 10);
    if (!Number.isFinite(qtd) || qtd < 1) return;

    if (usarCarrinhoLocal) {
      dispatch(atualizarQuantidade({ uuid, quantidade: qtd }));
      return;
    }

    void dispatch(sincronizarLinhaCarrinho({ livroUuid: uuid, quantidade: qtd }));
  };

  const handleRemover = (uuid: string) => {
    if (usarCarrinhoLocal) {
      dispatch(removerItem(uuid));
      return;
    }

    void dispatch(sincronizarLinhaCarrinho({ livroUuid: uuid, quantidade: 0 }));
  };

  const handleRestaurarItemExpirado = (itemUuid: string) => {
    if (usarCarrinhoLocal) {
      dispatch(restaurarItemExpirado(itemUuid));
      return;
    }

    const itemExpirado = itensExpirados.find((item) => item.uuid === itemUuid);
    if (!itemExpirado) return;

    void dispatch(sincronizarLinhaCarrinho({ livroUuid: itemUuid, quantidade: itemExpirado.quantidade }));
  };

  const handleLimparItensExpirados = () => {
    dispatch(limparItensExpirados());
  };

  return (
    <div className={styles['carrinho-page']}>
      <h1 className="page-title">Carrinho de Compras</h1>
      <hr className={styles['carrinho-separator']} />

      <table className={styles['carrinho-table']}>
        <thead>
          <tr className={styles['carrinho-table-header']}>
            <th className={styles['carrinho-th']}>Produto</th>
            <th className={styles['carrinho-th']}>Preço Unit.</th>
            <th className={styles['carrinho-th']}>Quant.</th>
            <th className={styles['carrinho-th']}>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.itens.map((item) => (
            <tr key={item.uuid} data-cy="carrinho-linha-item">
              <td className={styles['carrinho-td-product']}>
                <img src={item.imagem} alt="Livro" className={styles['carrinho-item-image']} />
                <div>
                  <strong>{item.titulo}</strong><br />
                  <span className={styles['carrinho-product-isbn']}>ISBN: {item.isbn}</span>
                </div>
              </td>
              <td className={styles['carrinho-td']} data-label="Preço Unit.">R$ {(item.precoUnitario ?? 0).toFixed(2).replace('.', ',')}</td>
              <td className={styles['carrinho-td']} data-label="Quant.">
                <input
                  type="number"
                  value={item.quantidade}
                  onChange={(e) => handleUpdateQuantidade(item.uuid, e)}
                  className={styles['carrinho-input-qty']}
                />
              </td>
              <td className={styles['carrinho-td']} data-label="Subtotal">R$ {item.subtotal.toFixed(2).replace('.', ',')}</td>
              <td className={styles['carrinho-td']} data-label="Ações">
                <button
                  onClick={() => handleRemover(item.uuid)}
                  className={`btn-secondary ${styles['carrinho-btn-remove']}`}
                >
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {itensExpirados.length > 0 && (
        <section
          className={styles['carrinho-expirados-section']}
          aria-live="polite"
          data-cy="carrinho-itens-expirados"
        >
          <div className={styles['carrinho-expirados-header']}>
            <AlertTriangle size={20} className={styles['carrinho-expirados-icon']} />
            <span>
              {itensExpirados.length === 1
                ? '1 item foi removido por tempo expirado'
                : `${itensExpirados.length} itens foram removidos por tempo expirado`}
            </span>
          </div>

          <div className={styles['carrinho-expirados-list']}>
            {itensExpirados.map((item) => (
              <div key={item.uuid} className={styles['carrinho-expirado-item']} data-cy="carrinho-item-expirado">
                <img
                  src={item.imagem}
                  alt={`Capa de ${item.titulo}`}
                  className={styles['carrinho-expirado-image']}
                />
                <div className={styles['carrinho-expirado-info']}>
                  <div className={styles['carrinho-expirado-title']} title={item.titulo}>
                    {item.titulo}
                  </div>
                  <div className={styles['carrinho-expirado-isbn']}>ISBN: {item.isbn}</div>
                  <div className={styles['carrinho-expirado-preco']}>
                    R$ {item.precoUnitario.toFixed(2).replace('.', ',')}
                  </div>
                </div>
                <div className={styles['carrinho-expirado-actions']}>
                  <button
                    type="button"
                    onClick={() => handleRestaurarItemExpirado(item.uuid)}
                    className={styles['carrinho-expirado-btn-restaurar']}
                    data-cy="carrinho-btn-restaurar-item"
                  >
                    Adicionar novamente
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '15px', textAlign: 'right' }}>
            <button
              type="button"
              onClick={handleLimparItensExpirados}
              className={styles['carrinho-expirado-btn-limpar']}
              data-cy="carrinho-btn-limpar-expirados"
            >
              Limpar lista
            </button>
          </div>
        </section>
      )}

      <div className={`resumo ${styles['carrinho-resumo']}`}>
        <div className={`frete ${styles['carrinho-frete']}`}>
          <FreteCalculo
            entrega={entregaParaFreteCalculo}
            onFreteSelecionado={handleFreteSelecionado}
            freteSelecionado={freteSelecionado}
            pesoTotal={1}
            valorTotal={data.resumo.subtotal}
          />
          {freteSelecionado && (
            <p className={styles['carrinho-frete-selecionado']}>
              ✓ Frete {freteSelecionado.tipo} selecionado: R${' '}
              {freteSelecionado.valor.toFixed(2).replace('.', ',')} — {freteSelecionado.prazo}
            </p>
          )}
        </div>

        <div className={`totalizador ${styles['carrinho-totalizador']}`}>
          <p>Subtotal: R$ {data.resumo.subtotal.toFixed(2).replace('.', ',')}</p>
          <p>Frete: R$ {data.resumo.frete.toFixed(2).replace('.', ',')}</p>
          <hr className={styles['carrinho-total-separator']} />
          <h2 className={styles['carrinho-total-header']}>Total: R$ {data.resumo.total.toFixed(2).replace('.', ',')}</h2>

          <Link href={ROTAS.CHECKOUT}>
            <button 
              className={`btn-primary ${styles['carrinho-btn-finalizar']}`}
              data-cy="carrinho-finalizar-compra"
            >
              Finalizar Compra
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
