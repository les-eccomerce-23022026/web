import { useMeuPerfil } from './useMeuPerfil';
import { useNavigate } from 'react-router-dom';
import styles from './MeuPerfil.module.css';
import { Eye, EyeOff } from 'lucide-react';
import type { Genero } from '@/interfaces/ICliente';

export function MeuPerfil() {
  const {
    user,
    isLoading,
    message,
    messageType,
    perfilState,
    senhaState,
    enderecoState,
    cartaoState,
    handleDeleteAccount,
    secaoAtiva,
    setSecaoAtiva,
    dominios,
  } = useMeuPerfil();
  const navigate = useNavigate();

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
          className={`${styles.tabItem} ${secaoAtiva === 'perfil' ? styles.tabItemActive : ''}`}
          onClick={() => setSecaoAtiva('perfil')}
        >
          👤 Dados Pessoais
        </button>
        <button
          className={`${styles.tabItem} ${secaoAtiva === 'enderecos' ? styles.tabItemActive : ''}`}
          onClick={() => setSecaoAtiva('enderecos')}
        >
          📍 Endereços ({enderecoState.enderecos.length})
        </button>
        <button
          className={`${styles.tabItem} ${secaoAtiva === 'cartoes' ? styles.tabItemActive : ''}`}
          onClick={() => setSecaoAtiva('cartoes')}
        >
          💳 Cartões ({cartaoState.cartoes.length})
        </button>
        <button
          className={`${styles.tabItem} ${secaoAtiva === 'senha' ? styles.tabItemActive : ''}`}
          onClick={() => setSecaoAtiva('senha')}
        >
          🔒 Senha
        </button>
        <button
          className={`${styles.tabItem} ${secaoAtiva === 'perigo' ? styles.tabItemActive : ''}`}
          onClick={() => setSecaoAtiva('perigo')}
        >
          ⚠️ Conta
        </button>
      </nav>

      {/* Seção: Dados Pessoais - RF0022 */}
      {secaoAtiva === 'perfil' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Atualizar Dados Cadastrais</h2>
          <div className={styles.formRow}>
            <div className="form-group">
              <label>Nome Completo</label>
              <input
                type="text"
                value={perfilState.nome}
                onChange={(e) => perfilState.setNome(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className="form-group">
              <label>CPF</label>
              <input type="text" value={user.cpf} disabled />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input type="text" value={user.email} disabled />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className="form-group">
              <label>Gênero</label>
              <select
                value={perfilState.genero}
                onChange={(e) => perfilState.setGenero(e.target.value as Genero)}
              >
                {dominios.generosDisponiveis.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Data de Nascimento</label>
              <input
                type="date"
                value={perfilState.dataNascimento}
                onChange={(e) => perfilState.setDataNascimento(e.target.value)}
              />
            </div>
          </div>
          <fieldset className={styles.section}>
            <legend className={styles.sectionTitle}>Telefone</legend>
            <div className={styles.formRow}>
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={perfilState.telefoneTipo}
                  onChange={(e) => perfilState.setTelefoneTipo(e.target.value)}
                >
                  {dominios.tiposTelefone.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>DDD</label>
                <input
                  type="text"
                  maxLength={2}
                  value={perfilState.telefoneDdd}
                  onChange={(e) => perfilState.setTelefoneDdd(e.target.value)}
                />
              </div>
              <div className={`form-group ${styles.formGroupLarge}`}>
                <label>Número</label>
                <input
                  type="text"
                  value={perfilState.telefoneNumero}
                  onChange={(e) =>
                    perfilState.setTelefoneNumero(e.target.value)
                  }
                />
              </div>
            </div>
          </fieldset>
          <button
            className="btn-primary"
            onClick={perfilState.handleUpdateProfile}
          >
            Atualizar Dados
          </button>
        </section>
      )}

      {/* Seção: Endereços - RF0026 / RNF0034 */}
      {secaoAtiva === 'enderecos' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📍 Meus Endereços de Entrega</h2>

          <div className={styles.enderecoList}>
            {enderecoState.enderecos.map((end) => (
              <div key={end.uuid} className={styles.enderecoCard}>
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
                    className={`btn-secondary ${styles.btnSmall}`}
                    onClick={() =>
                      enderecoState.setEnderecoEditandoUuid(end.uuid)
                    }
                  >
                    Editar
                  </button>
                  <button
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
              className="btn-secondary"
              onClick={() => enderecoState.setShowNovoEndereco(true)}
            >
              + Adicionar Novo Endereço
            </button>
          )}

          {enderecoState.showNovoEndereco && (
            <div className={styles.novoPanel}>
              <h3 className={styles.novoPanelTitle}>Novo Endereço</h3>
              <div className="form-group">
                <label>Apelido (ex: Casa, Trabalho)</label>
                <input
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
                    value={enderecoState.novoEndTipoResidencia}
                    onChange={(e) =>
                      enderecoState.setNovoEndTipoResidencia(e.target.value)
                    }
                  >
                    {dominios.tiposResidencia.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo Logradouro</label>
                  <select
                    value={enderecoState.novoEndTipoLogradouro}
                    onChange={(e) =>
                      enderecoState.setNovoEndTipoLogradouro(e.target.value)
                    }
                  >
                    {dominios.tiposLogradouro.map((t) => (
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
                  className="btn-primary"
                  onClick={enderecoState.handleAdicionarEndereco}
                >
                  Salvar Endereço
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => enderecoState.setShowNovoEndereco(false)}
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
                  <span className={styles.cartaoBadge}>★ Preferencial</span>
                )}
                <div className={styles.cartaoActions}>
                  {cartaoState.cartaoPreferencialUuid !== cartao.uuid && (
                    <button
                      className={`btn-secondary ${styles.btnSmall}`}
                      onClick={() =>
                        cartaoState.handleDefinirPreferencial(cartao.uuid)
                      }
                    >
                      Definir Preferencial
                    </button>
                  )}
                  <button
                    className={styles.btnSmallDanger}
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
              className="btn-secondary"
              onClick={() => cartaoState.setShowNovoCartao(true)}
            >
              + Adicionar Novo Cartão
            </button>
          )}

          {cartaoState.showNovoCartao && (
            <div className={styles.novoPanel}>
              <h3 className={styles.novoPanelTitle}>Novo Cartão</h3>
              <div className="form-group">
                <label>Número do Cartão</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  value={cartaoState.novoCartaoNumero}
                  onChange={(e) =>
                    cartaoState.setNovoCartaoNumero(e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Nome Impresso no Cartão</label>
                <input
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
                    value={cartaoState.novoCartaoBandeira}
                    onChange={(e) =>
                      cartaoState.setNovoCartaoBandeira(e.target.value)
                    }
                  >
                    {dominios.bandeirasPermitidas.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Validade</label>
                  <input
                    type="text"
                    placeholder="MM/AAAA"
                    maxLength={7}
                    value={cartaoState.novoCartaoValidade}
                    onChange={(e) =>
                      cartaoState.setNovoCartaoValidade(e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <div className={styles.passwordWrapper}>
                    <input
                      type={cartaoState.showNovoCartaoCvv ? 'text' : 'password'}
                      placeholder="***"
                      maxLength={4}
                      className={styles.passwordInput}
                      value={cartaoState.novoCartaoCvv}
                      onChange={(e) =>
                        cartaoState.setNovoCartaoCvv(e.target.value)
                      }
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
              </div>
              <div className={styles.novoPanelActions}>
                <button
                  className="btn-primary"
                  onClick={cartaoState.handleAdicionarCartao}
                >
                  Salvar Cartão
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => cartaoState.setShowNovoCartao(false)}
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
            <p className={styles.messageError}>{senhaState.senhaError}</p>
          )}
          {senhaState.senhaSuccess && (
            <p className={styles.messageSuccess}>{senhaState.senhaSuccess}</p>
          )}
          <div className="form-group">
            <label>Senha Atual</label>
            <div className={styles.passwordWrapper}>
              <input
                type={senhaState.showSenhaAtual ? 'text' : 'password'}
                className={styles.passwordInput}
                value={senhaState.senhaAtual}
                onChange={(e) => senhaState.setSenhaAtual(e.target.value)}
              />
              <button
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
                type={senhaState.showNovaSenha ? 'text' : 'password'}
                className={styles.passwordInput}
                value={senhaState.novaSenha}
                onChange={(e) => senhaState.setNovaSenha(e.target.value)}
              />
              <button
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
                type={senhaState.showConfirmaNovaSenha ? 'text' : 'password'}
                className={styles.passwordInput}
                value={senhaState.confirmaNovaSenha}
                onChange={(e) => senhaState.setConfirmaNovaSenha(e.target.value)}
              />
              <button
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
          <button className={styles.btnDanger} onClick={handleDeleteAccount}>
            Solicitar Exclusão da Conta
          </button>
        </section>
      )}
    </div>
  );
}
