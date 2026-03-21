import { useMeuPerfil } from './useMeuPerfil';
import { useNavigate } from 'react-router-dom';
import styles from './MeuPerfil.module.css';
import { Eye, EyeOff } from 'lucide-react';
import type { Genero } from '@/interfaces/ICliente';
import { Modal } from '@/components/comum/Modal/Modal';
import { useMaskedField } from '@/hooks/useMaskedField';

export function MeuPerfil() {
  const {
    user,
    isLoading,
    message,
    messageType,
    cliente,
    perfilState,
    senhaState,
    enderecoState,
    cartaoState,
    handleDeleteAccount,
    secaoAtiva,
    setSecaoAtiva,
    dominios,
    confirmModal,
  } = useMeuPerfil();
  const navigate = useNavigate();

  // --- Helpers de Máscara (Hook Componentizado) ---
  const emailMask = useMaskedField({ 
    value: perfilState.visualizacaoEmail, 
    setter: perfilState.setVisualizacaoEmail 
  });
  
  const telMask = useMaskedField({ 
    value: perfilState.visualizacaoTelefone, 
    setter: perfilState.setVisualizacaoTelefone 
  });

  const nomeMask = useMaskedField({
    value: perfilState.nome,
    setter: perfilState.setNome
  });

  if (!user) return null;

  if (isLoading) {
    return <div className={styles.loading}>Carregando perfil...</div>;
  }

  return (
    <div className={styles.perfilPage}>
      <h1>Meu Perfil</h1>
      <p className={styles.perfilSubtitle}>
        Gerencie seus dados, endereços, cartões e segurança.
      </p>

      {/* Quick Links - RF0025 */}
      <div className={styles.quickLinks}>
        <button
          className={styles.quickLink}
          onClick={() => navigate('/pedidos')}
        >
          📦 Meus Pedidos
        </button>
        <button
          className={styles.quickLink}
          onClick={() => navigate('/carrinho')}
        >
          🛒 Meu Carrinho
        </button>
      </div>

      {/* Global Message */}
      {message && (
        <p
          className={
            messageType === 'success'
              ? styles.messageSuccess
              : styles.messageError
          }
        >
          {message}
        </p>
      )}

      {/* Tab Navigation */}
      <nav className={styles.tabNav}>
        <button
          data-cy="tab-perfil"
          className={`${styles.tabItem} ${secaoAtiva === 'perfil' ? styles.tabItemActive : ''}`}
          onClick={() => setSecaoAtiva('perfil')}
        >
          👤 Dados Pessoais
        </button>
        <button
          data-cy="tab-enderecos"
          className={`${styles.tabItem} ${secaoAtiva === 'enderecos' ? styles.tabItemActive : ''}`}
          onClick={() => setSecaoAtiva('enderecos')}
        >
          📍 Endereços ({enderecoState.enderecos.length})
        </button>
        <button
          data-cy="tab-cartoes"
          className={`${styles.tabItem} ${secaoAtiva === 'cartoes' ? styles.tabItemActive : ''}`}
          onClick={() => setSecaoAtiva('cartoes')}
        >
          💳 Cartões ({cartaoState.cartoes.length})
        </button>
        <button
          data-cy="tab-senha"
          className={`${styles.tabItem} ${secaoAtiva === 'senha' ? styles.tabItemActive : ''}`}
          onClick={() => setSecaoAtiva('senha')}
        >
          🔒 Senha
        </button>
        <button
          data-cy="tab-perigo"
          data-testid="tab-perigo"
          className={`${styles.tabItem} ${secaoAtiva === 'perigo' ? styles.tabItemActive : ''}`}
          onClick={() => setSecaoAtiva('perigo')}
        >
          ⚠️ Conta
        </button>
      </nav>

      {/* Seção: Dados Pessoais - RF0022 */}
      {secaoAtiva === 'perfil' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Dados Pessoais</h2>
          
          <div className={styles.formRow}>
            <div className="form-group">
              <label>Nome Completo</label>
              <input
                data-cy="perfil-nome-input"
                type="text"
                value={perfilState.nome}
                onChange={(e) => perfilState.setNome(e.target.value)}
                onFocus={() => nomeMask.onFocus(true)}
                onBlur={() => nomeMask.onBlur(cliente?.nome || '')}
                placeholder="Seu nome completo"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className="form-group">
              <label>Gênero</label>
              <select
                data-cy="perfil-genero-select"
                value={perfilState.genero}
                onChange={(e) => perfilState.setGenero(e.target.value as Genero)}
              >
                {dominios.generosDisponiveis.map((g: string) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Data de Nascimento</label>
              <input
                data-cy="perfil-nascimento-input"
                type="date"
                value={perfilState.dataNascimento}
                onChange={(e) => perfilState.setDataNascimento(e.target.value)}
              />
            </div>
          </div>

          <hr className={styles.divider} />
          <h3 className={styles.subTitle}>Contato</h3>


          <div className={styles.formRow}>
            <div className="form-group">
              <label>E-mail</label>
              <input
                data-cy="perfil-email-input"
                type="text"
                value={perfilState.visualizacaoEmail}
                onChange={(e) => perfilState.setVisualizacaoEmail(e.target.value)}
                onFocus={emailMask.onFocus}
                onBlur={() => emailMask.onBlur(cliente?.emailMascarado || cliente?.email || '')}
                placeholder="Seu e-mail"
              />
            </div>
            <div className="form-group">
              <label>CPF</label>
              <input
                data-cy="perfil-cpf-input"
                type="text"
                value={perfilState.visualizacaoCpf}
                readOnly
                title="O CPF não pode ser alterado após o cadastro."
              />
            </div>
          </div>

          <fieldset className={styles.fieldSetCritico}>
            <legend>Telefone</legend>
            <div className={styles.formRow}>
              <div className="form-group" style={{ flex: 0.5 }}>
                <label>Tipo</label>
                <select
                  data-cy="perfil-tel-tipo-select"
                  value={perfilState.novoTelefoneTipo}
                  onChange={(e) => perfilState.setNovoTelefoneTipo(e.target.value)}
                >
                  {dominios.tiposTelefone.map((t: string) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Número com DDD (apenas números)</label>
                <input
                  data-cy="perfil-tel-input"
                  type="text"
                  value={perfilState.visualizacaoTelefone}
                  onChange={(e) => perfilState.setVisualizacaoTelefone(e.target.value)}
                  onFocus={telMask.onFocus}
                  onBlur={() => {
                    const telOriginal = cliente?.telefone 
                      ? `(${cliente.telefone.ddd}) ${cliente.telefone.numeroMascarado || cliente.telefone.numero}` 
                      : '';
                    telMask.onBlur(telOriginal);
                  }}
                  placeholder="Ex: 11999999999"
                  maxLength={11}
                />
              </div>
            </div>
          </fieldset>

          <button
            data-cy="perfil-save-button"
            className="btn-primary"
            style={{ marginTop: '24px', width: '100%', padding: '14px' }}
            onClick={perfilState.handleUpdateProfile}
          >
            Salvar Todas as Alterações
          </button>

          {/* Modal de Confirmação de Senha para Dados Críticos */}
          <Modal
            isOpen={perfilState.showModalSenha}
            onClose={() => perfilState.setShowModalSenha(false)}
            title="⚠️ Confirmação de Segurança"
            variant="medium"
            footer={
              <>
                <button
                  data-cy="perfil-modal-cancel-button"
                  className="btn-secondary"
                  onClick={() => perfilState.setShowModalSenha(false)}
                >
                  Cancelar
                </button>
                <button
                  data-cy="perfil-modal-confirm-button"
                  className="btn-primary"
                  onClick={perfilState.confirmarUpdateComSenha}
                >
                  Confirmar e Salvar
                </button>
              </>
            }
          >
            <div className={styles.modalBody}>
              <p>
                Você está alterando dados críticos (**E-mail**, **CPF** ou **Telefone**). 
                Por motivos de segurança, confirme sua <strong>senha atual</strong> para prosseguir.
              </p>
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Sua Senha de Acesso</label>
                <div className={styles.passwordWrapper}>
                  <input
                    data-cy="perfil-modal-password-input"
                    type={perfilState.showSenhaConfirmacao ? 'text' : 'password'}
                    className={styles.passwordInput}
                    value={perfilState.senhaConfirmacao}
                    onChange={(e) => perfilState.setSenhaConfirmacao(e.target.value)}
                    placeholder="Digite sua senha"
                    autoFocus
                  />
                  <button
                    data-cy="perfil-modal-password-toggle"
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => perfilState.setShowSenhaConfirmacao(!perfilState.showSenhaConfirmacao)}
                  >
                    {perfilState.showSenhaConfirmacao ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        </section>
      )}

      {/* Seção: Endereços - RF0026 / RNF0034 */}
      {secaoAtiva === 'enderecos' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📍 Meus Endereços de Entrega</h2>

          <div className={styles.enderecoList}>
            {enderecoState.enderecos.map((end) => (
              <div key={end.uuid} className={styles.enderecoCard} data-cy={`endereco-card-${end.uuid}`}>
                <div className={styles.enderecoApelido}>
                  {end.apelido || 'Sem apelido'}
                </div>
                <div className={styles.enderecoDetalhe}>
                  {end.tipoLogradouro} {end.logradouro}, {end.numero}
                  {end.complemento && ` - ${end.complemento}`}
                  <br />
                  {end.bairro} - {end.cep}
                  <br />
                  {end.cidade}/{end.estado} - {end.pais}
                </div>
                <div className={styles.enderecoActions}>
                  <button
                    data-cy={`endereco-edit-button-${end.uuid}`}
                    className={`btn-secondary ${styles.btnSmall}`}
                    onClick={() =>
                      enderecoState.setEnderecoEditandoUuid(end.uuid)
                    }
                  >
                    Editar
                  </button>
                  <button
                    data-cy={`endereco-delete-button-${end.uuid}`}
                    className={styles.btnSmallDanger}
                    onClick={() =>
                      enderecoState.handleRemoverEndereco(end.uuid)
                    }
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!enderecoState.showNovoEndereco && (
            <button
              data-cy="endereco-add-button"
              className="btn-secondary"
              onClick={() => enderecoState.setShowNovoEndereco(true)}
            >
              + Adicionar Novo Endereço
            </button>
          )}

          {enderecoState.showNovoEndereco && (
            <div className={styles.novoPanel} data-cy="endereco-form-panel">
              <h3 className={styles.novoPanelTitle}>
                {enderecoState.enderecoEditandoUuid ? 'Editar Endereço' : 'Novo Endereço'}
              </h3>
              <div className="form-group">
                <label>Apelido (ex: Casa, Trabalho)</label>
                <input
                  data-cy="endereco-apelido-input"
                  type="text"
                  value={enderecoState.novoEndApelido}
                  onChange={(e) =>
                    enderecoState.setNovoEndApelido(e.target.value)
                  }
                />
              </div>
              <div className={styles.formRow}>
                <div className="form-group">
                  <label>Tipo Residência</label>
                  <select
                    data-cy="endereco-tipo-residencia-select"
                    value={enderecoState.novoEndTipoResidencia}
                    onChange={(e) =>
                      enderecoState.setNovoEndTipoResidencia(e.target.value)
                    }
                  >
                    {dominios.tiposResidencia.map((t: string) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo Logradouro</label>
                  <select
                    data-cy="endereco-tipo-logradouro-select"
                    value={enderecoState.novoEndTipoLogradouro}
                    onChange={(e) =>
                      enderecoState.setNovoEndTipoLogradouro(e.target.value)
                    }
                  >
                    {dominios.tiposLogradouro.map((t: string) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={`form-group ${styles.formGroupLarge}`}>
                  <label>Logradouro *</label>
                  <input
                    data-cy="endereco-logradouro-input"
                    type="text"
                    value={enderecoState.novoEndLogradouro}
                    onChange={(e) =>
                      enderecoState.setNovoEndLogradouro(e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Número *</label>
                  <input
                    data-cy="endereco-numero-input"
                    type="text"
                    value={enderecoState.novoEndNumero}
                    onChange={(e) =>
                      enderecoState.setNovoEndNumero(e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Complemento</label>
                <input
                  data-cy="endereco-complemento-input"
                  type="text"
                  value={enderecoState.novoEndComplemento}
                  onChange={(e) =>
                    enderecoState.setNovoEndComplemento(e.target.value)
                  }
                />
              </div>
              <div className={styles.formRow}>
                <div className="form-group">
                  <label>Bairro *</label>
                  <input
                    data-cy="endereco-bairro-input"
                    type="text"
                    value={enderecoState.novoEndBairro}
                    onChange={(e) =>
                      enderecoState.setNovoEndBairro(e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>CEP *</label>
                  <input
                    data-cy="endereco-cep-input"
                    type="text"
                    value={enderecoState.novoEndCep}
                    onChange={(e) =>
                      enderecoState.setNovoEndCep(e.target.value)
                    }
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className="form-group">
                  <label>Cidade *</label>
                  <input
                    data-cy="endereco-cidade-input"
                    type="text"
                    value={enderecoState.novoEndCidade}
                    onChange={(e) =>
                      enderecoState.setNovoEndCidade(e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Estado *</label>
                  <input
                    data-cy="endereco-estado-input"
                    type="text"
                    maxLength={2}
                    value={enderecoState.novoEndEstado}
                    onChange={(e) =>
                      enderecoState.setNovoEndEstado(
                        e.target.value.toUpperCase(),
                      )
                    }
                  />
                </div>
                <div className="form-group">
                  <label>País</label>
                  <input
                    data-cy="endereco-pais-input"
                    type="text"
                    value={enderecoState.novoEndPais}
                    onChange={(e) =>
                      enderecoState.setNovoEndPais(e.target.value)
                    }
                  />
                </div>
              </div>
              <div className={styles.novoPanelActions}>
                <button
                  data-cy="endereco-submit-button"
                  className="btn-primary"
                  onClick={enderecoState.handleAdicionarEndereco}
                >
                  {enderecoState.enderecoEditandoUuid ? 'Salvar Alterações' : 'Salvar Endereço'}
                </button>
                <button
                  data-cy="endereco-cancel-button"
                  className="btn-secondary"
                  onClick={() => {
                    enderecoState.setShowNovoEndereco(false);
                    enderecoState.setEnderecoEditandoUuid(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Seção: Cartões - RF0027 */}
      {secaoAtiva === 'cartoes' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>💳 Meus Cartões de Crédito</h2>

          <div className={styles.cartaoList}>
            {cartaoState.cartoes.map((cartao) => (
              <div
                key={cartao.uuid}
                data-cy={`cartao-card-${cartao.uuid}`}
                className={`${styles.cartaoCard} ${
                  cartaoState.cartaoPreferencialUuid === cartao.uuid
                    ? styles.cartaoCardPreferencial
                    : ''
                }`}
              >
                <div className={styles.cartaoBandeira}>{cartao.bandeira}</div>
                <div className={styles.cartaoFinal}>
                  •••• •••• •••• {cartao.final}
                </div>
                <div className={styles.cartaoNome}>{cartao.nomeImpresso}</div>
                <div className={styles.cartaoValidade}>
                  Validade: {cartao.validade}
                </div>
                {cartaoState.cartaoPreferencialUuid === cartao.uuid && (
                  <span className={styles.cartaoBadge} data-cy="cartao-preferencial-badge">★ Preferencial</span>
                )}
                <div className={styles.cartaoActions}>
                  <button
                    data-cy={`cartao-edit-button-${cartao.uuid}`}
                    className={`btn-secondary ${styles.btnSmall}`}
                    disabled={cartaoState.isLoading}
                    onClick={() =>
                      cartaoState.setCartaoEditandoUuid(cartao.uuid)
                    }
                  >
                    Editar
                  </button>
                  {cartaoState.cartaoPreferencialUuid !== cartao.uuid && (
                    <button
                      data-cy={`cartao-preferencial-button-${cartao.uuid}`}
                      className={`btn-secondary ${styles.btnSmall}`}
                      disabled={cartaoState.isLoading}
                      onClick={() =>
                        cartaoState.handleDefinirPreferencial(cartao.uuid)
                      }
                    >
                      Definir Preferencial
                    </button>
                  )}
                  <button
                    data-cy={`cartao-delete-button-${cartao.uuid}`}
                    className={styles.btnSmallDanger}
                    disabled={cartaoState.isLoading}
                    onClick={() =>
                      cartaoState.handleRemoverCartao(cartao.uuid)
                    }
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!cartaoState.showNovoCartao && (
            <button
              data-cy="cartao-add-button"
              className="btn-secondary"
              onClick={() => cartaoState.setShowNovoCartao(true)}
            >
              + Adicionar Novo Cartão
            </button>
          )}

          {cartaoState.showNovoCartao && (
            <div className={styles.novoPanel} data-cy="cartao-form-panel">
              <h3 className={styles.novoPanelTitle}>
                {cartaoState.cartaoEditandoUuid ? 'Editar Cartão' : 'Novo Cartão'}
              </h3>
              <div className="form-group">
                <label>Número do Cartão</label>
                <input
                  data-cy="cartao-numero-input"
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  value={cartaoState.novoCartaoNumero}
                  disabled={!!cartaoState.cartaoEditandoUuid}
                  onChange={(e) =>
                    cartaoState.setNovoCartaoNumero(e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Nome Impresso no Cartão</label>
                <input
                  data-cy="cartao-nome-input"
                  type="text"
                  placeholder="NOME COMO ESTÁ NO CARTÃO"
                  value={cartaoState.novoCartaoNome}
                  onChange={(e) =>
                    cartaoState.setNovoCartaoNome(e.target.value)
                  }
                />
              </div>
              <div className={styles.formRow}>
                <div className="form-group">
                  <label>Bandeira</label>
                  <select
                    data-cy="cartao-bandeira-select"
                    value={cartaoState.novoCartaoBandeira}
                    onChange={(e) =>
                      cartaoState.setNovoCartaoBandeira(e.target.value)
                    }
                  >
                    {dominios.bandeirasPermitidas.map((b: string) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Validade</label>
                  <input
                    data-cy="cartao-validade-input"
                    type="text"
                    placeholder="MM/AAAA"
                    maxLength={7}
                    pattern="\d{2}/\d{4}"
                    title="Formato esperado: MM/AAAA"
                    value={cartaoState.novoCartaoValidade}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 2) {
                        cartaoState.setNovoCartaoValidade(value);
                        return;
                      }
                      cartaoState.setNovoCartaoValidade(`${value.slice(0, 2)}/${value.slice(2, 6)}`);
                    }}                  />
                </div>
                {!cartaoState.cartaoEditandoUuid && (
                  <div className="form-group">
                    <label>CVV</label>
                    <div className={styles.passwordWrapper}>
                      <input
                        data-cy="cartao-cvv-input"
                        type={cartaoState.showNovoCartaoCvv ? 'text' : 'password'}
                        placeholder="***"
                        maxLength={3}
                        pattern="\d{3}"
                        title="O CVV deve ter exatamente 3 dígitos numéricos"
                        className={styles.passwordInput}
                        value={cartaoState.novoCartaoCvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          cartaoState.setNovoCartaoCvv(value);
                        }}
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() =>
                          cartaoState.setShowNovoCartaoCvv(
                            !cartaoState.showNovoCartaoCvv,
                          )
                        }
                      >
                        {cartaoState.showNovoCartaoCvv ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.novoPanelActions}>
                <button
                  data-cy="cartao-submit-button"
                  className="btn-primary"
                  disabled={cartaoState.isLoading}
                  onClick={cartaoState.handleAdicionarCartao}
                >
                  {cartaoState.isLoading ? 'Salvando...' : (cartaoState.cartaoEditandoUuid ? 'Atualizar Cartão' : 'Salvar Cartão')}
                </button>
                <button
                  data-cy="cartao-cancel-button"
                  className="btn-secondary"
                  disabled={cartaoState.isLoading}
                  onClick={() => {
                    cartaoState.setShowNovoCartao(false);
                    cartaoState.setCartaoEditandoUuid(null);
                    cartaoState.setNovoCartaoNumero('');
                    cartaoState.setNovoCartaoNome('');
                    cartaoState.setNovoCartaoValidade('');
                    cartaoState.setNovoCartaoCvv('');
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Seção: Alterar Senha - RF0028 */}
      {secaoAtiva === 'senha' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔒 Alterar Senha</h2>
          {senhaState.senhaError && (
            <p data-cy="senha-error-message" className={styles.messageError}>{senhaState.senhaError}</p>
          )}
          {senhaState.senhaSuccess && (
            <p data-cy="senha-success-message" className={styles.messageSuccess}>{senhaState.senhaSuccess}</p>
          )}
          <div className="form-group">
            <label>Senha Atual</label>
            <div className={styles.passwordWrapper}>
              <input
                data-cy="senha-atual-input"
                type={senhaState.showSenhaAtual ? 'text' : 'password'}
                className={styles.passwordInput}
                value={senhaState.senhaAtual}
                onChange={(e) => senhaState.setSenhaAtual(e.target.value)}
              />
              <button
                data-cy="senha-atual-toggle"
                type="button"
                className={styles.passwordToggle}
                onClick={() =>
                  senhaState.setShowSenhaAtual(!senhaState.showSenhaAtual)
                }
              >
                {senhaState.showSenhaAtual ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Nova Senha</label>
            <div className={styles.passwordWrapper}>
              <input
                data-cy="nova-senha-input"
                type={senhaState.showNovaSenha ? 'text' : 'password'}
                className={styles.passwordInput}
                value={senhaState.novaSenha}
                onChange={(e) => senhaState.setNovaSenha(e.target.value)}
              />
              <button
                data-cy="nova-senha-toggle"
                type="button"
                className={styles.passwordToggle}
                onClick={() =>
                  senhaState.setShowNovaSenha(!senhaState.showNovaSenha)
                }
              >
                {senhaState.showNovaSenha ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
            <small className={styles.hint}>
              Mín. 8 caracteres, maiúsculas, minúsculas, números e especiais
            </small>
          </div>
          <div className="form-group">
            <label>Confirmar Nova Senha</label>
            <div className={styles.passwordWrapper}>
              <input
                data-cy="confirmar-nova-senha-input"
                type={senhaState.showConfirmaNovaSenha ? 'text' : 'password'}
                className={styles.passwordInput}
                value={senhaState.confirmaNovaSenha}
                onChange={(e) => senhaState.setConfirmaNovaSenha(e.target.value)}
              />
              <button
                data-cy="confirmar-nova-senha-toggle"
                type="button"
                className={styles.passwordToggle}
                onClick={() =>
                  senhaState.setShowConfirmaNovaSenha(
                    !senhaState.showConfirmaNovaSenha,
                  )
                }
              >
                {senhaState.showConfirmaNovaSenha ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>
          <button
            data-cy="senha-submit-button"
            className="btn-secondary"
            onClick={senhaState.handleChangePassword}
          >
            Alterar Senha
          </button>
        </section>
      )}

      {/* Seção: Zona de Perigo - RF0023 */}
      {secaoAtiva === 'perigo' && (
        <section className={`${styles.section} ${styles.dangerZone}`}>
          <h2 className={styles.sectionTitle}>⚠️ Zona de Perigo</h2>
          <p>
            Ao solicitar exclusão, sua conta será inativada e você não poderá
            mais acessá-la. Esta ação não pode ser desfeita.
          </p>
          <button 
            data-cy="inativar-conta-button"
            data-testid="btn-solicitar-exclusao"
            style={{ backgroundColor: '#dc3545', color: '#ffffff', opacity: 1, visibility: 'visible', display: 'block' }} 
            className={styles.btnDanger} 
            onClick={handleDeleteAccount}
          >
            Solicitar Exclusão da Conta
          </button>
        </section>
      )}

      {/* Modal de Confirmação Genérico */}
      <Modal
        isOpen={confirmModal.show}
        onClose={confirmModal.close}
        title={confirmModal.config.title}
        variant={confirmModal.config.variant === 'danger' ? 'danger' : 'medium'}
        footer={
          <>
            <button 
              data-cy="modal-cancel-button" 
              className="btn-secondary" 
              onClick={confirmModal.close}
            >
              Cancelar
            </button>
            <button
              data-cy="modal-confirm-button"
              data-testid="modal-confirm-button"
              className={confirmModal.config.variant === 'danger' ? styles.btnDanger : 'btn-primary'}
              onClick={confirmModal.config.onConfirm}
            >
              Confirmar
            </button>
          </>
        }
      >
        <p>{confirmModal.config.message}</p>
      </Modal>
    </div>
  );
}
