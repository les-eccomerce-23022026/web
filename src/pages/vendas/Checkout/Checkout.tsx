import { useState } from 'react';
import styles from './Checkout.module.css';
import { useCheckout } from '@/hooks/useCheckout';
import { usePagamento } from '@/hooks/usePagamento';
import { useEntrega } from '@/hooks/useEntrega';
import { useAppSelector } from '@/store/hooks';
import { CartaoCreditoForm, CartoesSalvosList, CupomInput, PagamentoParcialInput } from '@/components/checkout/pagamento';
import { FreteCalculo, EnderecoEntregaCard } from '@/components/checkout/entrega';
import { Modal } from '@/components/comum/Modal';
import type { ICartaoCreditoInput } from '@/interfaces/IPagamento';
import type { ICupomAplicado } from '@/interfaces/IPagamento';

export function Checkout() {
  const { data, loading, error, finalizando, handleFinalizarCompra } = useCheckout();
  const {
    cuponsAplicados,
    aplicarCupom,
    removerCupom,
    pagamentosParciais,
    adicionarPagamentoParcial,
    removerPagamentoParcial
  } = usePagamento();

  const {
    freteSelecionado,
    selecionarFrete
  } = useEntrega();
  
  const carrinho = useAppSelector((state) => state.carrinho.data);
  const [mostrarNovoCartao, setMostrarNovoCartao] = useState(false);
  const [cartaoSelecionado, setCartaoSelecionado] = useState<string | null>(null);
  const [novoCartao, setNovoCartao] = useState<ICartaoCreditoInput | null>(null);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<string | null>(null);

  if (loading) return <p className={styles['checkout-status-message']}>Carregando dados de checkout...</p>;
  if (error) return <p className={styles['checkout-status-message']}>Erro ao carregar checkout.</p>;
  if (!data) return <p className={styles['checkout-status-message']}>Nenhum dado de checkout encontrado.</p>;

  // Resumo derivado do carrinho Redux para refletir o estado real do usuário
  const quantidadeItens = carrinho?.itens.reduce((acc, item) => acc + item.quantidade, 0) ?? 0;
  const subtotal = carrinho?.resumo.subtotal ?? 0;
  const frete = freteSelecionado?.valor ?? carrinho?.resumo.frete ?? data.resumoPedido.frete;

  // Calcular desconto total dos cupons
  const descontoCupons = cuponsAplicados.reduce((acc, cupom) => {
    if (cupom.tipo === 'promocional') {
      // Cupom promocional é porcentagem
      return acc + (subtotal * cupom.valor / 100);
    } else {
      // Cupom de troca é valor fixo
      return acc + cupom.valor;
    }
  }, 0);

  const total = subtotal + frete - descontoCupons;
  const valorPagoParcialmente = pagamentosParciais.reduce((acc, p) => acc + p.valor, 0);

  const handleAplicarCupom = (cupom: ICupomAplicado) => {
    aplicarCupom({
      uuid: cupom.uuid,
      codigo: cupom.codigo,
      tipo: cupom.tipo,
      valor: cupom.valor
    });
  };

  const handleCartaoSelecionado = (uuid: string) => {
    setCartaoSelecionado(uuid);
    setNovoCartao(null);
  };

  const handleNovoCartao = (dados: ICartaoCreditoInput) => {
    setNovoCartao(dados);
    setCartaoSelecionado(null);
    setMostrarNovoCartao(false);
  };

  const handleAdicionarPagamentoParcial = (cartaoUuid: string, valor: number) => {
    const sucesso = adicionarPagamentoParcial(cartaoUuid, valor);
    return sucesso;
  };

  return (
    <div className={styles['checkout-page']}>
      <h1 className="page-title">Finalizar Compra</h1>
      <div className={`breadcrumb ${styles['checkout-breadcrumb']}`}>
        <strong>1. Identificação</strong> &gt; <strong>2. Entrega</strong> &gt; <span className={styles['checkout-breadcrumb-active']}>3. Pagamento</span>
      </div>

      <div className={styles['checkout-grid']}>
        <div className={styles['coluna-principal']}>
          {/* Endereço de Entrega */}
          <div className={`card ${styles['checkout-card-spaced']}`}>
             <h3>Endereço de Entrega</h3>
             {data.enderecosDisponiveis && data.enderecosDisponiveis.length > 0 ? (
               <>
                 <EnderecoEntregaCard
                   enderecos={data.enderecosDisponiveis}
                   selecionado={enderecoSelecionado}
                   onSelect={setEnderecoSelecionado}
                 />
                 {enderecoSelecionado && (
                   <p className={styles['endereco-selecionado-info']}>
                     ✓ Endereço selecionado para entrega
                   </p>
                 )}
               </>
             ) : (
               <>
                 <p>{data.enderecoEntrega.logradouro}, {data.enderecoEntrega.numero}, {data.enderecoEntrega.complemento}</p>
                 <p>{data.enderecoEntrega.cidade} - {data.enderecoEntrega.estado}, CEP: {data.enderecoEntrega.cep}</p>
                 <a href="#" className={styles['checkout-link-alt']}>Alterar endereço</a>
               </>
             )}
          </div>

          {/* Cálculo de Frete */}
          <div className={`card ${styles['checkout-card-spaced']}`}>
             <h3 className={styles['checkout-section-title']}>Frete</h3>
             <FreteCalculo
               onFreteSelecionado={selecionarFrete}
               freteSelecionado={freteSelecionado}
               pesoTotal={1}
               valorTotal={subtotal}
             />
             {freteSelecionado && (
               <p className={styles['frete-selecionado-info']}>
                 ✓ Frete {freteSelecionado.tipo} selecionado: R$ {freteSelecionado.valor.toFixed(2).replace('.', ',')} - {freteSelecionado.prazo}
               </p>
             )}
          </div>

          {/* Forma de Pagamento - Cartões Salvos */}
          <div className={`card ${styles['checkout-card-spaced']}`}>
             <h3 className={styles['checkout-section-title']}>Forma de Pagamento</h3>
             
             <CartoesSalvosList
               cartoes={data.cartoesSalvos}
               selecionado={cartaoSelecionado}
               onSelect={handleCartaoSelecionado}
             />
             
             <div className={styles['checkout-form-row']}>
               <span className={styles['checkout-text-nowrap']}>ou</span>
               <button 
                 className={`btn-secondary ${styles['checkout-text-nowrap']}`} 
                 onClick={() => setMostrarNovoCartao(true)}
                 data-cy="checkout-add-card-button"
               >
                 + Novo Cartão
               </button>
             </div>

             {/* Cartão selecionado ou novo cartão */}
             {cartaoSelecionado && (
               <div className={styles['cartao-selecionado-info']}>
                 <p>✓ Cartão selecionado: {data.cartoesSalvos.find(c => c.uuid === cartaoSelecionado)?.bandeira} final {data.cartoesSalvos.find(c => c.uuid === cartaoSelecionado)?.final}</p>
               </div>
             )}

             {novoCartao && (
               <div className={styles['novo-cartao-info']}>
                 <p>✓ Novo cartão: {novoCartao.bandeira} final {novoCartao.numero.slice(-4)}</p>
                 <button 
                   className={styles['btn-alterar']}
                   onClick={() => setNovoCartao(null)}
                 >
                   Alterar
                 </button>
               </div>
             )}

             {/* Pagamento Parcial (Múltiplos Cartões) */}
             {data.cartoesSalvos.length > 0 && (
               <PagamentoParcialInput
                 cartoesSalvos={data.cartoesSalvos}
                 valorTotal={total}
                 valorJaPago={valorPagoParcialmente}
                 onAdicionar={handleAdicionarPagamentoParcial}
                 onRemover={removerPagamentoParcial}
                 pagamentosParciais={pagamentosParciais}
               />
             )}
          </div>

          {/* Cupons */}
          <div className="card">
             <CupomInput
               cuponsDisponiveis={data.cuponsDisponiveis}
               cuponsAplicados={cuponsAplicados}
               onAplicar={handleAplicarCupom}
               onRemover={removerCupom}
             />
          </div>
        </div>

        {/* Resumo do Pedido */}
        <div className={styles['coluna-lateral']}>
           <div className={`card ${styles['checkout-summary-card']}`}>
              <h3 className={styles['checkout-summary-title']}>Resumo do Pedido</h3>
              <ul className={styles['checkout-summary-list']}>
                <li className={styles['checkout-summary-item']}>
                  <span>Subtotal ({quantidadeItens} {quantidadeItens === 1 ? 'item' : 'itens'}):</span> 
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </li>
                <li className={styles['checkout-summary-item']}>
                  <span>Frete:</span> 
                  <span>R$ {frete.toFixed(2).replace('.', ',')}</span>
                </li>
                {descontoCupons > 0 && (
                  <li className={styles['checkout-summary-item-discount']}>
                    <span>Cupons Aplicados:</span> 
                    <span>- R$ {descontoCupons.toFixed(2).replace('.', ',')}</span>
                  </li>
                )}
                {valorPagoParcialmente > 0 && (
                  <li className={styles['checkout-summary-item-discount']}>
                    <span>Pago com Cartões:</span> 
                    <span>- R$ {valorPagoParcialmente.toFixed(2).replace('.', ',')}</span>
                  </li>
                )}
              </ul>

              <hr className={styles['checkout-summary-divider']} />

              <div className={styles['checkout-total-row']}>
                <span className={styles['checkout-total-label']}>Total a Pagar:</span>
                <span className={styles['checkout-total-value']}>
                  R$ {(total - valorPagoParcialmente).toFixed(2).replace('.', ',')}
                </span>
              </div>

              <button
                className={`btn-primary ${styles['checkout-btn-finish']}`}
                onClick={handleFinalizarCompra}
                disabled={finalizando || !enderecoSelecionado || !freteSelecionado || (total - valorPagoParcialmente <= 0 && !cartaoSelecionado && !novoCartao)}
                data-cy="checkout-finish-button"
              >
                {finalizando ? 'Processando...' : 'Concluir Pedido'}
              </button>

              {enderecoSelecionado && freteSelecionado && (
                <p className={styles['checkout-entrega-info']}>
                  ✓ Entrega e frete configurados
                </p>
              )}
              
              {(cartaoSelecionado || novoCartao || valorPagoParcialmente > 0) && (
                <p className={styles['checkout-pagamento-info']}>
                  ✓ Pagamento pronto para processamento
                </p>
              )}
           </div>
        </div>
      </div>

      {/* Modal para Novo Cartão */}
      <Modal
        isOpen={mostrarNovoCartao}
        onClose={() => setMostrarNovoCartao(false)}
        title="Adicionar Novo Cartão"
      >
        <CartaoCreditoForm
          bandeirasPermitidas={data.bandeirasPermitidas}
          onSubmit={handleNovoCartao}
          onCancel={() => setMostrarNovoCartao(false)}
        />
      </Modal>
    </div>
  );
}
