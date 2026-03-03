import styles from './Pagamento.module.css';
import { usePagamento } from '@/hooks/usePagamento';

const STEPS = ['Endereço e Frete', 'Pagamento', 'Revisão'];

export function Pagamento() {
  const pg = usePagamento();

  if (pg.loading) return <p className={styles['pagamento-status-message']}>Carregando dados de pagamento...</p>;
  if (pg.error) return <p className={styles['pagamento-status-message']}>Erro ao carregar pagamento.</p>;
  if (!pg.info) return <p className={styles['pagamento-status-message']}>Nenhum dado encontrado.</p>;
  if (!pg.carrinho || pg.carrinho.itens.length === 0) {
    return <p className={styles['pagamento-status-message']}>Seu carrinho está vazio. Adicione itens antes de prosseguir.</p>;
  }

  const formatMoeda = (valor: number) => `R$ ${valor.toFixed(2).replace('.', ',')}`;

  const enderecoSelecionado = pg.info.enderecosCliente.find(
    (e) => e.uuid === pg.enderecoSelecionadoUuid,
  );
  const freteSelecionado = pg.info.freteOpcoes.find(
    (f) => f.uuid === pg.freteSelecionadoUuid,
  );

  return (
    <div className={styles['pagamento-page']}>
      <h1 className="page-title">Finalizar Compra</h1>

      {/* Stepper visual */}
      <div className={styles.stepper}>
        {STEPS.map((label, index) => (
          <div key={label} className={styles.stepper}>
            {index > 0 && (
              <div
                className={`${styles['stepper-connector']} ${index <= pg.stepAtual ? styles['stepper-connector--ativo'] : ''}`}
              />
            )}
            <div
              className={`${styles['stepper-step']} ${
                index === pg.stepAtual ? styles['stepper-step--ativo'] : ''
              } ${index < pg.stepAtual ? styles['stepper-step--completo'] : ''}`}
            >
              <span className={styles['stepper-circle']}>
                {index < pg.stepAtual ? '✓' : index + 1}
              </span>
              <span className={styles['stepper-label']}>{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles['pagamento-grid']}>
        {/* Coluna principal */}
        <div>
          {/* ===== STEP 0: Endereço e Frete ===== */}
          {pg.stepAtual === 0 && (
            <>
              {/* Alerta geral de validação */}
              {pg.tentouAvancarStep0 && !pg.podeAvancarStep0 && (
                <div className={styles['validacao-alerta']} data-cy="validacao-step0">
                  ⚠️ Preencha os campos obrigatórios antes de continuar:
                  <ul className={styles['validacao-lista']}>
                    {!pg.enderecoSelecionadoUuid && <li>Selecione um endereço de entrega</li>}
                    {!pg.freteSelecionadoUuid && <li>Selecione uma opção de frete</li>}
                  </ul>
                </div>
              )}

              {/* RF0035: Selecionar endereço de entrega */}
              <div className={`card ${styles['pagamento-card']} ${
                pg.tentouAvancarStep0 && !pg.enderecoSelecionadoUuid ? styles['pagamento-card--erro'] : ''
              }`}>
                <h3>
                  <span className={styles.icon}>📍</span> Endereço de Entrega
                  {pg.tentouAvancarStep0 && !pg.enderecoSelecionadoUuid && (
                    <span className={styles['campo-obrigatorio']}>⚠️ Obrigatório</span>
                  )}
                </h3>
                <div className={styles['endereco-grid']}>
                  {pg.info.enderecosCliente.map((end) => (
                    <div
                      key={end.uuid}
                      className={`${styles['endereco-option']} ${
                        pg.enderecoSelecionadoUuid === end.uuid ? styles['endereco-option--selecionado'] : ''
                      }`}
                      onClick={() => pg.setEnderecoSelecionadoUuid(end.uuid)}
                      data-cy={`endereco-option-${end.uuid}`}
                    >
                      <div className={styles['endereco-apelido']}>
                        {pg.enderecoSelecionadoUuid === end.uuid && (
                          <span className={styles['check-icon']}>✓</span>
                        )}
                        {end.apelido}
                      </div>
                      <div className={styles['endereco-detalhe']}>
                        {end.tipoLogradouro} {end.logradouro}, {end.numero}
                        {end.complemento && ` - ${end.complemento}`}<br />
                        {end.bairro} · {end.cidade} - {end.estado}<br />
                        CEP: {end.cep}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RF0034: Calcular frete */}
              <div className={`card ${styles['pagamento-card']} ${
                pg.tentouAvancarStep0 && !pg.freteSelecionadoUuid ? styles['pagamento-card--erro'] : ''
              }`}>
                <h3>
                  <span className={styles.icon}>🚚</span> Opção de Frete
                  {pg.tentouAvancarStep0 && !pg.freteSelecionadoUuid && (
                    <span className={styles['campo-obrigatorio']}>⚠️ Obrigatório</span>
                  )}
                </h3>
                <div className={styles['frete-grid']}>
                  {pg.info.freteOpcoes.map((frete) => (
                    <div
                      key={frete.uuid}
                      className={`${styles['frete-option']} ${
                        pg.freteSelecionadoUuid === frete.uuid ? styles['frete-option--selecionado'] : ''
                      }`}
                      onClick={() => pg.setFreteSelecionadoUuid(frete.uuid)}
                      data-cy={`frete-option-${frete.uuid}`}
                    >
                      <div className={styles['frete-info']}>
                        <span className={styles['frete-tipo']}>{frete.tipo}</span>
                        <span className={styles['frete-prazo']}>{frete.prazo}</span>
                      </div>
                      <span
                        className={`${styles['frete-valor']} ${frete.valor === 0 ? styles['frete-valor--gratis'] : ''}`}
                      >
                        {frete.valor === 0 ? 'GRÁTIS' : formatMoeda(frete.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles['step-navigation']}>
                <div />
                <button
                  className="btn-primary"
                  onClick={pg.avancarStep}
                  data-cy="pagamento-step0-next"
                >
                  Continuar para Pagamento →
                </button>
              </div>
            </>
          )}

          {/* ===== STEP 1: Pagamento (Cartões + Cupons) ===== */}
          {pg.stepAtual === 1 && (
            <>
              {/* RF0036: Selecionar forma de pagamento - Cupons */}
              <div className={`card ${styles['pagamento-card']}`}>
                <h3><span className={styles.icon}>🎟️</span> Cupons de Troca / Promocional</h3>
                <div className={styles['cupom-input-group']}>
                  <input
                    type="text"
                    placeholder="Código do cupom (ex: LIVRO10)"
                    value={pg.codigoCupom}
                    onChange={(e) => pg.setCodigoCupom(e.target.value)}
                    data-cy="pagamento-cupom-input"
                  />
                  <button className="btn-secondary" onClick={pg.aplicarCupom} data-cy="pagamento-cupom-apply">
                    Aplicar
                  </button>
                </div>
                {pg.erroCupom && <p className={styles['cupom-erro']}>{pg.erroCupom}</p>}
                <p className={styles['rn-info']}>RN0033: Apenas 1 cupom promocional por compra. Cupons de troca sem limite.</p>

                {pg.cuponsAplicados.length > 0 && (
                  <div className={styles['cupons-aplicados']}>
                    {pg.cuponsAplicados.map((cupom) => (
                      <div key={cupom.uuid} className={styles['cupom-badge']}>
                        <div className={styles['cupom-badge-info']}>
                          <span className={styles['cupom-badge-codigo']}>
                            {cupom.codigo} ({cupom.tipo})
                          </span>
                          <span className={styles['cupom-badge-valor']}>
                            - {formatMoeda(cupom.valor)}
                          </span>
                        </div>
                        <button
                          className={styles['cupom-badge-remove']}
                          onClick={() => pg.removerCupom(cupom.uuid)}
                          data-cy={`cupom-remove-${cupom.uuid}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {pg.gerarCupomTroca && (
                  <div className={styles['aviso-cupom-troca']}>
                    ⚠️ <strong>RN0036:</strong> O valor dos cupons supera o total da compra.
                    Um cupom de troca de <strong>{formatMoeda(pg.valorCupomTroca)}</strong> será gerado após a finalização.
                  </div>
                )}
              </div>

              {/* RF0036: Cartões de crédito */}
              {pg.totalAposCupons > 0 && (
                <div className={`card ${styles['pagamento-card']}`}>
                  <h3><span className={styles.icon}>💳</span> Cartão de Crédito</h3>
                  <div className={styles['cartao-form-row']}>
                    <select
                      value={pg.cartaoSelecionadoUuid}
                      onChange={(e) => pg.setCartaoSelecionadoUuid(e.target.value)}
                      data-cy="pagamento-cartao-select"
                    >
                      <option value="">Selecionar cartão</option>
                      {pg.info.cartoesCliente.map((c) => (
                        <option key={c.uuid} value={c.uuid}>
                          {c.bandeira} •••• {c.final} — {c.nomeImpresso}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder={`Valor (${formatMoeda(pg.valorRestanteCartao)})`}
                      value={pg.valorCartao}
                      onChange={(e) => pg.setValorCartao(e.target.value)}
                      data-cy="pagamento-cartao-valor"
                    />
                    <button className="btn-secondary" onClick={pg.adicionarPagamentoCartao} data-cy="pagamento-cartao-add">
                      Adicionar
                    </button>
                  </div>
                  {pg.erroCartao && <p className={styles['cartao-erro']}>{pg.erroCartao}</p>}
                  <p className={styles['rn-info']}>
                    RN0034: Valor mínimo de R$ 10,00 por cartão. RN0035: Se houver cupom, saldo pode ser inferior.
                  </p>

                  {pg.pagamentosCartao.length > 0 && (
                    <div className={styles['cartoes-alocados']}>
                      {pg.pagamentosCartao.map((pag) => {
                        const cartao = pg.info?.cartoesCliente.find((c) => c.uuid === pag.cartaoUuid);
                        return (
                          <div key={pag.cartaoUuid} className={styles['cartao-alocado']}>
                            <span className={styles['cartao-alocado-info']}>
                              {cartao?.bandeira} •••• {cartao?.final}
                            </span>
                            <span className={styles['cartao-alocado-valor']}>
                              {formatMoeda(pag.valor)}
                            </span>
                            <button
                              className={styles['cartao-alocado-remove']}
                              onClick={() => pg.removerPagamentoCartao(pag.cartaoUuid)}
                              data-cy={`cartao-remove-${pag.cartaoUuid}`}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div
                    className={`${styles['valor-restante']} ${pg.pagamentoCompleto ? styles['valor-restante--ok'] : ''}`}
                  >
                    {pg.pagamentoCompleto
                      ? '✓ Pagamento completo!'
                      : `Falta alocar: ${formatMoeda(pg.valorRestanteCartao)}`}
                  </div>
                </div>
              )}

              {/* Alerta pagamento incompleto */}
              {pg.tentouAvancarStep1 && !pg.pagamentoCompleto && pg.totalAposCupons > 0 && (
                <div className={styles['validacao-alerta']} data-cy="validacao-step1">
                  ⚠️ Ainda falta alocar <strong>{formatMoeda(pg.valorRestanteCartao)}</strong> em cartão(ões) de crédito.
                </div>
              )}

              <div className={styles['step-navigation']}>
                <button className="btn-secondary" onClick={pg.voltarStep} data-cy="pagamento-step1-back">
                  ← Voltar
                </button>
                <button
                  className="btn-primary"
                  onClick={pg.avancarStep}
                  data-cy="pagamento-step1-next"
                >
                  Revisar Pedido →
                </button>
              </div>
            </>
          )}

          {/* ===== STEP 2: Revisão e Confirmação ===== */}
          {pg.stepAtual === 2 && (
            <>
              <div className={`card ${styles['pagamento-card']}`}>
                <h3><span className={styles.icon}>📋</span> Revisão do Pedido</h3>

                <div className={styles['revisao-section']}>
                  <h4>📍 Endereço de Entrega</h4>
                  {enderecoSelecionado && (
                    <div className={styles['revisao-detalhe']}>
                      <strong>{enderecoSelecionado.apelido}</strong><br />
                      {enderecoSelecionado.tipoLogradouro} {enderecoSelecionado.logradouro}, {enderecoSelecionado.numero}
                      {enderecoSelecionado.complemento && ` - ${enderecoSelecionado.complemento}`}<br />
                      {enderecoSelecionado.bairro} · {enderecoSelecionado.cidade} - {enderecoSelecionado.estado}<br />
                      CEP: {enderecoSelecionado.cep}
                    </div>
                  )}
                </div>

                <div className={styles['revisao-section']}>
                  <h4>🚚 Frete</h4>
                  {freteSelecionado && (
                    <div className={styles['revisao-detalhe']}>
                      {freteSelecionado.tipo} — {freteSelecionado.prazo} — {freteSelecionado.valor === 0 ? 'GRÁTIS' : formatMoeda(freteSelecionado.valor)}
                    </div>
                  )}
                </div>

                <div className={styles['revisao-section']}>
                  <h4>💳 Forma de Pagamento</h4>
                  <div className={styles['revisao-detalhe']}>
                    {pg.cuponsAplicados.map((c) => (
                      <div key={c.uuid} className={styles['revisao-pagamento-item']}>
                        🎟️ Cupom {c.codigo} ({c.tipo}): - {formatMoeda(c.valor)}
                      </div>
                    ))}
                    {pg.pagamentosCartao.map((pag) => {
                      const cartao = pg.info?.cartoesCliente.find((c) => c.uuid === pag.cartaoUuid);
                      return (
                        <div key={pag.cartaoUuid} className={styles['revisao-pagamento-item']}>
                          💳 {cartao?.bandeira} •••• {cartao?.final}: {formatMoeda(pag.valor)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className={styles['step-navigation']}>
                <button className="btn-secondary" onClick={pg.voltarStep} data-cy="pagamento-step2-back">
                  ← Voltar
                </button>
                <button
                  className={`btn-primary ${styles['btn-concluir']}`}
                  onClick={pg.finalizarCompra}
                  data-cy="pagamento-finish"
                >
                  🛒 Concluir Pedido
                </button>
              </div>
            </>
          )}
        </div>

        {/* Coluna lateral: Resumo sempre visível */}
        <div>
          <div className={`card ${styles['resumo-card']}`}>
            <h3 className={styles['resumo-titulo']}>Resumo do Pedido</h3>

            <div className={styles['resumo-itens']}>
              {pg.carrinho.itens.map((item) => (
                <div key={item.uuid} className={styles['resumo-item-livro']}>
                  <img src={item.imagem} alt={item.titulo} className={styles['resumo-item-imagem']} />
                  <div className={styles['resumo-item-info']}>
                    <span className={styles['resumo-item-titulo']}>{item.titulo}</span>
                    <span className={styles['resumo-item-qtd']}>Qtd: {item.quantidade}</span>
                  </div>
                  <span className={styles['resumo-item-preco']}>{formatMoeda(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <ul className={styles['resumo-lista-valores']}>
              <li className={styles['resumo-linha']}>
                <span>Subtotal:</span>
                <span>{formatMoeda(pg.subtotal)}</span>
              </li>
              <li className={styles['resumo-linha']}>
                <span>Frete:</span>
                <span>{pg.valorFrete === 0 ? 'GRÁTIS' : formatMoeda(pg.valorFrete)}</span>
              </li>
              {pg.totalCupons > 0 && (
                <li className={`${styles['resumo-linha']} ${styles['resumo-linha--desconto']}`}>
                  <span>Cupons:</span>
                  <span>- {formatMoeda(pg.totalCupons)}</span>
                </li>
              )}
            </ul>

            <hr className={styles['resumo-divider']} />

            <div className={styles['resumo-total-row']}>
              <span className={styles['resumo-total-label']}>Total:</span>
              <span className={styles['resumo-total-value']}>
                {formatMoeda(pg.totalAposCupons)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay de processamento */}
      {pg.statusPagamento === 'processando' && (
        <div className={styles['processando-overlay']}>
          <div className={styles['processando-card']}>
            <div className={styles.spinner} />
            <h2>Processando Pagamento...</h2>
            <p>Validando cupons e autorizando operadora (RN0037)</p>
          </div>
        </div>
      )}
    </div>
  );
}
