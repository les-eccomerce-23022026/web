import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import styles from './Carrinho.module.css';
import { EmptyState } from '@/components/Comum/EmptyState/EmptyState';
import { FreteCalculo, type FreteCalculoEntregaApi } from '@/components/FinalizarCompra/Entrega';
import { useEntrega } from '@/hooks/useEntrega';
import type { IFreteOpcao } from '@/interfaces/entrega';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  removerItem,
  atualizarQuantidade,
  sincronizarLinhaCarrinho,
  definirFreteResumoCarrinho,
} from '@/store/slices/carrinhoSlice';
import {
  persistirCotacaoFreteCarrinho,
  limparCotacaoFreteCarrinho,
} from '@/store/slices/cotacaoFreteSlice';
import { assinaturaItensCarrinho } from '@/utils/carrinhoAssinatura';
import { USE_MOCK } from '@/config/apiConfig';

export const Carrinho = () => {
  const dispatch = useAppDispatch();
  const { data, error, status } = useAppSelector((state) => state.carrinho);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
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

  if (status === 'loading') return <p className={styles['carrinho-status-message']}>Carregando carrinho...</p>;
  if (status === 'failed' || error) return <p className={styles['carrinho-status-message']}>Erro ao carregar carrinho.</p>;
  if (!data) return <p className={styles['carrinho-status-message']}>Carregando carrinho...</p>;
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
          <Link to="/" className={styles['carrinho-empty-link']}>
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
    } else {
      void dispatch(sincronizarLinhaCarrinho({ livroUuid: uuid, quantidade: qtd }));
    }
  };

  const handleRemover = (uuid: string) => {
    if (usarCarrinhoLocal) {
      dispatch(removerItem(uuid));
    } else {
      void dispatch(sincronizarLinhaCarrinho({ livroUuid: uuid, quantidade: 0 }));
    }
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
            <tr key={item.uuid}>
              <td className={styles['carrinho-td-product']}>
                <img src={item.imagem} alt="Livro" className={styles['carrinho-item-image']} />
                <div>
                  <strong>{item.titulo}</strong><br />
                  <span className={styles['carrinho-product-isbn']}>ISBN: {item.isbn}</span>
                </div>
              </td>
              <td className={styles['carrinho-td']} data-label="Preço Unit.">R$ {item.precoUnitario.toFixed(2).replace('.', ',')}</td>
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

          <Link to="/pagamento"><button className={`btn-primary ${styles['carrinho-btn-finalizar']}`}>Finalizar Compra</button></Link>
        </div>
      </div>
    </div>
  );
};
