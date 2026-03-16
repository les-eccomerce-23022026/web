import { useLoginArea } from './useLoginArea';
import styles from './LoginArea.module.css';
import { Eye, EyeOff } from 'lucide-react';
import type { IEnderecoCliente } from '@/interfaces/IPagamento';

function EnderecoForm({
  titulo,
  endereco,
  onChange,
  tiposResidencia,
  tiposLogradouro,
}: {
  titulo: string;
  endereco: Omit<IEnderecoCliente, 'uuid'>;
  onChange: (e: Omit<IEnderecoCliente, 'uuid'>) => void;
  tiposResidencia: string[];
  tiposLogradouro: string[];
}) {
  const handleField = (campo: string, valor: string) => {
    onChange({ ...endereco, [campo]: valor });
  };

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{titulo}</legend>
      <div className={styles.formRow}>
        <div className="form-group">
          <label>Apelido (ex: Casa, Trabalho)</label>
          <input
            type="text"
            placeholder="Casa"
            value={endereco.apelido}
            onChange={(e) => handleField('apelido', e.target.value)}
          />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className="form-group">
          <label>Tipo Residência</label>
          <select
            value={endereco.tipoResidencia}
            onChange={(e) => handleField('tipoResidencia', e.target.value)}
          >
            {tiposResidencia.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Tipo Logradouro</label>
          <select
            value={endereco.tipoLogradouro}
            onChange={(e) => handleField('tipoLogradouro', e.target.value)}
          >
            {tiposLogradouro.map((t) => (
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
            placeholder="Nome da rua"
            value={endereco.logradouro}
            onChange={(e) => handleField('logradouro', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Número *</label>
          <input
            type="text"
            placeholder="123"
            value={endereco.numero}
            onChange={(e) => handleField('numero', e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Complemento</label>
        <input
          type="text"
          placeholder="Apto, Bloco..."
          value={endereco.complemento}
          onChange={(e) => handleField('complemento', e.target.value)}
        />
      </div>
      <div className={styles.formRow}>
        <div className="form-group">
          <label>Bairro *</label>
          <input
            type="text"
            value={endereco.bairro}
            onChange={(e) => handleField('bairro', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>CEP *</label>
          <input
            type="text"
            placeholder="00000-000"
            value={endereco.cep}
            onChange={(e) => handleField('cep', e.target.value)}
          />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className="form-group">
          <label>Cidade *</label>
          <input
            type="text"
            value={endereco.cidade}
            onChange={(e) => handleField('cidade', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Estado *</label>
          <input
            type="text"
            placeholder="SP"
            maxLength={2}
            value={endereco.estado}
            onChange={(e) => handleField('estado', e.target.value.toUpperCase())}
          />
        </div>
        <div className="form-group">
          <label>País</label>
          <input
            type="text"
            value={endereco.pais}
            onChange={(e) => handleField('pais', e.target.value)}
          />
        </div>
      </div>
    </fieldset>
  );
}

export function LoginArea() {
  const { loginState, registerState, dominios } = useLoginArea();

  return (
    <div className={styles['auth-page']}>
      <div className={`card ${styles['login-box-card']}`} data-cy="login-form">
        <h2 className={styles['login-title']}>Já sou Cliente</h2>
        <div className="form-group">
          <label>E-mail ou CPF</label>
          <input
            type="text"
            placeholder="admin@livraria.com.br (admin)"
            value={loginState.email}
            onChange={(e) => loginState.setEmail(e.target.value)}
            data-cy="login-email-input"
          />
        </div>
        <div className="form-group">
          <label>Senha</label>
          <div className={styles.passwordWrapper}>
            <input
              type={loginState.showPasswordLogin ? 'text' : 'password'}
              placeholder="password123"
              className={styles.passwordInput}
              value={loginState.senha}
              onChange={(e) => loginState.setSenha(e.target.value)}
              data-cy="login-password-input"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() =>
                loginState.setShowPasswordLogin(!loginState.showPasswordLogin)
              }
              aria-label={
                loginState.showPasswordLogin ? 'Esconder senha' : 'Mostrar senha'
              }
            >
              {loginState.showPasswordLogin ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
          <a href="#" className={styles['login-forgot-password']}>
            Esqueci minha senha
          </a>
        </div>
        {loginState.loginError && (
          <p className={styles['auth-message-error']}>{loginState.loginError}</p>
        )}
        <button
          onClick={loginState.handleLogin}
          className={`btn-primary ${styles['login-btn-enter']}`}
          data-cy="login-submit-button"
        >
          Entrar
        </button>
      </div>

      <div className={`card ${styles['register-box-card']}`}>
        {!registerState.showRegister ? (
          <>
            <h2 className={styles['register-title']}>Quero me Cadastrar</h2>
            <p className={styles['register-text']}>
              Crie sua conta na LES Livraria para acessar promoções exclusivas,
              histórico de compras, troca de livros fácil e um checkout mais rápido
              para suas próximas leituras.
            </p>
            {registerState.regSuccess && (
              <p className={styles['auth-message-success']}>
                {registerState.regSuccess}
              </p>
            )}
            <button
              className={`btn-secondary ${styles['login-btn-register']}`}
              onClick={() => registerState.setShowRegister(true)}
              data-cy="register-toggle-button"
            >
              Criar Nova Conta
            </button>
          </>
        ) : (
          <>
            <h2 className={styles['register-title']}>Criar Conta</h2>

            {/* Stepper */}
            <div className={styles.stepper}>
              <div
                className={`${styles.stepperItem} ${registerState.regStep >= 1 ? styles.stepperItemActive : ''}`}
                onClick={registerState.regStep === 2 ? registerState.handlePrevStep : undefined}
                style={registerState.regStep === 2 ? { cursor: 'pointer' } : undefined}
              >
                <span className={styles.stepperNumber}>1</span>
                <span className={styles.stepperLabel}>Dados Pessoais</span>
              </div>
              <div className={styles.stepperDivider} />
              <div
                className={`${styles.stepperItem} ${registerState.regStep >= 2 ? styles.stepperItemActive : ''}`}
                onClick={registerState.regStep === 1 ? registerState.handleNextStep : undefined}
                style={registerState.regStep === 1 ? { cursor: 'pointer' } : undefined}
              >
                <span className={styles.stepperNumber}>2</span>
                <span className={styles.stepperLabel}>Endereço</span>
              </div>
            </div>

            {registerState.regError && (
              <p className={styles['auth-message-error']}>
                {registerState.regError}
              </p>
            )}

            {/* Step 1: Dados Pessoais */}
            {registerState.regStep === 1 && (
              <div className={styles.stepContent}>
                <div className="form-group">
                  <label>Nome Completo *</label>
                  <input
                    type="text"
                    value={registerState.regNome}
                    onChange={(e) => registerState.setRegNome(e.target.value)}
                    data-cy="register-nome-input"
                  />
                </div>
                <div className="form-group">
                  <label>CPF * (11 números ou 000.000.000-00)</label>
                  <input
                    type="text"
                    placeholder="Ex: 12345678901"
                    value={registerState.regCpf}
                    onChange={(e) => registerState.setRegCpf(e.target.value)}
                    data-cy="register-cpf-input"
                  />
                </div>
                <div className="form-group">
                  <label>E-mail *</label>
                  <input
                    type="email"
                    value={registerState.regEmail}
                    onChange={(e) => registerState.setRegEmail(e.target.value)}
                    data-cy="register-email-input"
                  />
                </div>
                <div className={styles.formRow}>
                  <div className="form-group">
                    <label>Gênero *</label>
                    <select
                      value={registerState.regGenero}
                      onChange={(e) =>
                        registerState.setRegGenero(
                          e.target.value as typeof registerState.regGenero,
                        )
                      }
                      data-cy="register-genero-select"
                    >
                      {dominios.generosDisponiveis.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Data de Nascimento *</label>
                    <input
                      type="date"
                      value={registerState.regDataNascimento}
                      onChange={(e) =>
                        registerState.setRegDataNascimento(e.target.value)
                      }
                      data-cy="register-nascimento-input"
                    />
                  </div>
                </div>
                <fieldset className={styles.fieldset}>
                  <legend className={styles.legend}>Telefone</legend>
                  <div className={styles.formRow}>
                    <div className="form-group">
                      <label>Tipo</label>
                      <select
                        value={registerState.regTelefone.tipo}
                        onChange={(e) =>
                          registerState.setRegTelefone({
                            ...registerState.regTelefone,
                            tipo: e.target.value as 'Celular' | 'Residencial' | 'Comercial',
                          })
                        }
                      >
                        {dominios.tiposTelefone.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>DDD *</label>
                      <input
                        type="text"
                        placeholder="11"
                        maxLength={2}
                        value={registerState.regTelefone.ddd}
                        onChange={(e) =>
                          registerState.setRegTelefone({
                            ...registerState.regTelefone,
                            ddd: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className={`form-group ${styles.formGroupLarge}`}>
                      <label>Número *</label>
                      <input
                        type="text"
                        placeholder="999887766"
                        value={registerState.regTelefone.numero}
                        onChange={(e) =>
                          registerState.setRegTelefone({
                            ...registerState.regTelefone,
                            numero: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </fieldset>
                <div className="form-group">
                  <label>Senha *</label>
                  <div className={styles.passwordWrapper}>
                    <input
                      type={
                        registerState.showPasswordRegister ? 'text' : 'password'
                      }
                      className={styles.passwordInput}
                      value={registerState.regSenha}
                      onChange={(e) => registerState.setRegSenha(e.target.value)}
                      data-cy="register-senha-input"
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() =>
                        registerState.setShowPasswordRegister(
                          !registerState.showPasswordRegister,
                        )
                      }
                      aria-label={
                        registerState.showPasswordRegister
                          ? 'Esconder senha'
                          : 'Mostrar senha'
                      }
                    >
                      {registerState.showPasswordRegister ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  <small className={styles.hint}>
                    Mín. 8 caracteres, letras maiúsculas/minúsculas, números e
                    especiais
                  </small>
                </div>
                <div className="form-group">
                  <label>Confirmar Senha *</label>
                  <div className={styles.passwordWrapper}>
                    <input
                      type={
                        registerState.showConfirmPasswordRegister
                          ? 'text'
                          : 'password'
                      }
                      className={styles.passwordInput}
                      value={registerState.regConfirmaSenha}
                      onChange={(e) =>
                        registerState.setRegConfirmaSenha(e.target.value)
                      }
                      data-cy="register-confirmacao-senha-input"
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() =>
                        registerState.setShowConfirmPasswordRegister(
                          !registerState.showConfirmPasswordRegister,
                        )
                      }
                      aria-label={
                        registerState.showConfirmPasswordRegister
                          ? 'Esconder senha'
                          : 'Mostrar senha'
                      }
                    >
                      {registerState.showConfirmPasswordRegister ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
                <div className={styles['auth-form-actions']}>
                  <button
                    className={`btn-primary ${styles['login-btn-register']}`}
                    onClick={registerState.handleNextStep}
                    data-cy="register-next-step-button"
                  >
                    Próximo: Endereço →
                  </button>
                  <button
                    className={`btn-secondary ${styles['login-btn-register']}`}
                    onClick={registerState.handleCancelRegister}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Endereços */}
            {registerState.regStep === 2 && (
              <div className={styles.stepContent}>
                <EnderecoForm
                  titulo="Endereço de Cobrança (obrigatório)"
                  endereco={registerState.regEnderecoCobranca}
                  onChange={registerState.setRegEnderecoCobranca}
                  tiposResidencia={dominios.tiposResidencia}
                  tiposLogradouro={dominios.tiposLogradouro}
                />

                <div className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="endereco-igual"
                    checked={registerState.isEnderecoEntregaIgual}
                    onChange={(e) =>
                      registerState.setIsEnderecoEntregaIgual(e.target.checked)
                    }
                  />
                  <label htmlFor="endereco-igual">
                    Endereço de entrega é o mesmo de cobrança
                  </label>
                </div>

                {!registerState.isEnderecoEntregaIgual && (
                  <EnderecoForm
                    titulo="Endereço de Entrega (obrigatório)"
                    endereco={registerState.regEnderecoEntrega}
                    onChange={registerState.setRegEnderecoEntrega}
                    tiposResidencia={dominios.tiposResidencia}
                    tiposLogradouro={dominios.tiposLogradouro}
                  />
                )}

                <div className={styles['auth-form-actions']}>
                  <button
                    className={`btn-secondary ${styles['login-btn-register']}`}
                    onClick={registerState.handlePrevStep}
                  >
                    ← Voltar
                  </button>
                  <button
                    className={`btn-primary ${styles['login-btn-register']}`}
                    onClick={registerState.handleRegister}
                    disabled={registerState.isRegistering}
                    data-cy="register-submit-button"
                  >
                    {registerState.isRegistering
                      ? 'Cadastrando...'
                      : 'Finalizar Cadastro'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
