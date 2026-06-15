'use client';

import { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Mail,
  Calendar,
  X,
  MapPin,
  CreditCard,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useGestaoClientes } from './useGestaoClientes';
import styles from './style.module.css';

function formatarData(isoDate: string | null | undefined): string {
  if (!isoDate) return 'Nunca';
  try {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

type IAba = 'resumo' | 'enderecos' | 'cartoes';

function SkeletonCard() {
  return (
    <div className={styles.cardCliente} style={{ pointerEvents: 'none' }}>
      <div className={styles.cardHeader}>
        <div className={styles.skeletonText} style={{ width: '60%', height: 16 }} />
        <div className={styles.skeletonText} style={{ width: 48, height: 18, borderRadius: 12 }} />
      </div>
      <div className={styles.cardCorpo}>
        <div className={styles.skeletonText} style={{ width: '80%', height: 13 }} />
        <div className={styles.skeletonText} style={{ width: '50%', height: 13 }} />
      </div>
    </div>
  );
}

function SkeletonDetalhe() {
  return (
    <div className={styles.skeletonDetalhe}>
      <div className={styles.skeletonText} style={{ width: 50, height: 50, borderRadius: '50%' }} />
      <div className={styles.skeletonText} style={{ width: '60%', height: 18, marginTop: 12 }} />
      <div className={styles.skeletonText} style={{ width: '40%', height: 13, marginTop: 8 }} />
      <div className={styles.skeletonText} style={{ width: '100%', height: 13, marginTop: 24 }} />
      <div className={styles.skeletonText} style={{ width: '80%', height: 13, marginTop: 8 }} />
      <div className={styles.skeletonText} style={{ width: '90%', height: 13, marginTop: 8 }} />
    </div>
  );
}

function GestaoClientes() {
  const {
    clientes,
    loading,
    filtroBusca,
    setFiltroBusca,
    filtroAtivo,
    setFiltroAtivo,
    selecionarCliente,
    clienteSelecionado,
    setClienteSelecionado,
    detalheCliente,
    loadingDetalhe,
    total,
    totalPaginas,
    pagina,
    irParaPagina,
    modalConfirmar,
    setModalConfirmar,
    confirmarAlterarStatus,
    toastMsg,
    toastTipo,
  } = useGestaoClientes();

  const [abaAtiva, setAbaAtiva] = useState<IAba>('resumo');

  return (
    <div className={styles.container}>
      {/* Toast */}
      {toastMsg && (
        <div className={`${styles.toast} ${toastTipo === 'erro' ? styles.toastErro : styles.toastSucesso}`}>
          {toastMsg}
        </div>
      )}

      {/* Modal de confirmação */}
      {modalConfirmar && detalheCliente && (
        <div className={styles.modalOverlay} data-cy="cliente-modal-overlay">
          <div className={styles.modal}>
            <AlertTriangle size={32} className={detalheCliente.ativo ? styles.iconePerigo : styles.iconeSucesso} />
            <h3>{detalheCliente.ativo ? 'Inativar cliente?' : 'Reativar cliente?'}</h3>
            <p>
              {detalheCliente.ativo
                ? `O cliente "${detalheCliente.nome}" será inativado e não poderá realizar compras.`
                : `O cliente "${detalheCliente.nome}" será reativado.`}
            </p>
            <div className={styles.modalAcoes}>
              <button
                className={styles.btnSecundario}
                onClick={() => setModalConfirmar(false)}
                data-cy="cliente-modal-cancelar"
              >
                Cancelar
              </button>
              <button
                className={detalheCliente.ativo ? styles.btnPerigo : styles.btnSucesso}
                onClick={confirmarAlterarStatus}
                data-cy="cliente-modal-confirmar"
              >
                {detalheCliente.ativo ? 'Inativar' : 'Reativar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={styles.headerSection}>
        <div>
          <h2>Gestão de Clientes</h2>
          <p className={styles.subtitulo}>RF0024 — Consulta e Listagem de Clientes</p>
        </div>
        <div className={styles.statsPanel}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Total</span>
            <span className={styles.statValue}>{total}</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        <div className={styles.buscaWrapper}>
          <Search size={16} className={styles.buscaIcon} />
          <input
            type="text"
            className={styles.inputBusca}
            placeholder="Buscar por nome, CPF ou Email..."
            value={filtroBusca}
            onChange={(e) => setFiltroBusca(e.target.value)}
            data-cy="clientes-busca-input"
          />
        </div>
        <div className={styles.filtroStatusWrapper}>
          <Filter size={16} className={styles.filtroIcon} />
          <select
            className={styles.selectStatus}
            value={filtroAtivo}
            onChange={(e) => setFiltroAtivo(e.target.value as 'todos' | 'ativo' | 'inativo')}
            data-cy="clientes-filtro-status"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Somente Ativos</option>
            <option value="inativo">Somente Inativos</option>
          </select>
        </div>
      </div>

      <div className={styles.gridPrincipal}>
        {/* Lista de Clientes */}
        <div>
          <div className={styles.listaClientes}>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            ) : clientes.length === 0 ? (
              <div className={styles.vazio}>
                <Users size={48} />
                <p>Nenhum cliente encontrado.</p>
              </div>
            ) : (
              clientes.map((cliente) => (
                <div
                  key={cliente.uuid}
                  className={`${styles.cardCliente} ${clienteSelecionado?.uuid === cliente.uuid ? styles.cardAtivo : ''}`}
                  onClick={() => {
                    setAbaAtiva('resumo');
                    selecionarCliente(cliente);
                  }}
                  data-cy={`cliente-card-${cliente.uuid}`}
                >
                  <div className={styles.cardHeader}>
                    <h4>{cliente.nome}</h4>
                    <span className={`${styles.badgeAtivo} ${cliente.ativo ? styles.badgeSuccess : styles.badgeError}`}>
                      {cliente.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className={styles.cardCorpo}>
                    <span>{cliente.email}</span>
                    <span>CPF: {cliente.cpf}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Paginação */}
          {!loading && totalPaginas > 1 && (
            <div className={styles.paginacao}>
              <button
                className={styles.btnPagina}
                disabled={pagina <= 1}
                onClick={() => irParaPagina(pagina - 1)}
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <span className={styles.paginacaoInfo}>
                Página {pagina} de {totalPaginas} — {total} clientes
              </span>
              <button
                className={styles.btnPagina}
                disabled={pagina >= totalPaginas}
                onClick={() => irParaPagina(pagina + 1)}
                aria-label="Próxima página"
              >
                Próximo <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Painel de Detalhes */}
        {clienteSelecionado ? (
          <div className={styles.painelDetalhes}>
            <div className={styles.detalhesHeader}>
              <h3>Detalhes do Cliente</h3>
              <button
                className={styles.btnFechar}
                onClick={() => setClienteSelecionado(null)}
                aria-label="Fechar detalhes"
              >
                <X size={20} />
              </button>
            </div>

            {loadingDetalhe ? (
              <SkeletonDetalhe />
            ) : (
              <>
                {/* Perfil básico */}
                <div className={styles.infoGroup}>
                  <div className={styles.perfilBasico}>
                    <div className={styles.avatar}>
                      {clienteSelecionado.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className={styles.nomeDetalhe}>{clienteSelecionado.nome}</h4>
                      <div className={styles.rankingBadge}>
                        <Calendar size={14} /> Cadastrado em: {formatarData(clienteSelecionado.criadoEm)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Abas */}
                <div className={styles.abas}>
                  {(['resumo', 'enderecos', 'cartoes'] as IAba[]).map((aba) => (
                    <button
                      key={aba}
                      className={`${styles.aba} ${abaAtiva === aba ? styles.abaAtiva : ''}`}
                      onClick={() => setAbaAtiva(aba)}
                    >
                      {aba === 'resumo' && 'Resumo'}
                      {aba === 'enderecos' && 'Endereços'}
                      {aba === 'cartoes' && 'Cartões'}
                    </button>
                  ))}
                </div>

                {/* Aba: Resumo */}
                {abaAtiva === 'resumo' && (
                  <div>
                    <div className={styles.infoGroup}>
                      <h5 className={styles.grupoTitulo}>Dados de Contato</h5>
                      <div className={styles.infoLinha}>
                        <Mail size={16} />
                        <span>{clienteSelecionado.email}</span>
                      </div>
                    </div>

                    <div className={styles.infoGroup}>
                      <h5 className={styles.grupoTitulo}>Dados Pessoais</h5>
                      <div className={styles.infoLinha}>
                        <span className={styles.infoLabel}>CPF:</span>
                        {clienteSelecionado.cpf}
                      </div>
                      <div className={styles.infoLinha}>
                        <span className={styles.infoLabel}>Status:</span>
                        <span className={`${styles.badgeAtivo} ${clienteSelecionado.ativo ? styles.badgeSuccess : styles.badgeError}`}>
                          {clienteSelecionado.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>

                    {detalheCliente && (
                      <div className={styles.infoGroup}>
                        <h5 className={styles.grupoTitulo}>
                          <ShoppingBag size={13} style={{ display: 'inline', marginRight: 4 }} />
                          Resumo de Pedidos
                        </h5>
                        <div className={styles.infoLinha}>
                          <span className={styles.infoLabel}>Pedidos:</span>
                          {detalheCliente.resumoPedidos.totalPedidos}
                        </div>
                        <div className={styles.infoLinha}>
                          <span className={styles.infoLabel}>Total gasto:</span>
                          {formatarMoeda(detalheCliente.resumoPedidos.totalGasto)}
                        </div>
                        <div className={styles.infoLinha}>
                          <span className={styles.infoLabel}>Último pedido:</span>
                          {formatarData(detalheCliente.resumoPedidos.ultimoPedidoEm)}
                        </div>
                      </div>
                    )}

                    {/* Ação inativar/reativar */}
                    {detalheCliente && (
                      <button
                        className={detalheCliente.ativo ? styles.btnPerigo : styles.btnSucesso}
                        style={{ width: '100%', marginTop: 8 }}
                        onClick={() => setModalConfirmar(true)}
                        data-cy="cliente-toggle-status-btn"
                      >
                        {detalheCliente.ativo ? 'Inativar cliente' : 'Reativar cliente'}
                      </button>
                    )}
                  </div>
                )}

                {/* Aba: Endereços */}
                {abaAtiva === 'enderecos' && (
                  <div>
                    {!detalheCliente || detalheCliente.enderecos.length === 0 ? (
                      <div className={styles.abaVazia}>
                        <MapPin size={32} opacity={0.3} />
                        <p>Nenhum endereço cadastrado.</p>
                      </div>
                    ) : (
                      detalheCliente.enderecos.map((end, idx) => (
                        <div key={idx} className={styles.enderecoCard}>
                          <div className={styles.enderecoHeader}>
                            <MapPin size={14} />
                            <strong>{end.apelido}</strong>
                            {end.principal && (
                              <span className={`${styles.badgeAtivo} ${styles.badgePrincipal}`}>
                                Principal
                              </span>
                            )}
                          </div>
                          <div className={styles.enderecoLinhas}>
                            {end.logradouro}, {end.numero}
                            {end.complemento ? ` — ${end.complemento}` : ''}<br />
                            {end.bairro} — {end.cidade}/{end.estado}<br />
                            CEP: {end.cep}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Aba: Cartões */}
                {abaAtiva === 'cartoes' && (
                  <div>
                    {!detalheCliente || detalheCliente.cartoes.length === 0 ? (
                      <div className={styles.abaVazia}>
                        <CreditCard size={32} opacity={0.3} />
                        <p>Nenhum cartão cadastrado.</p>
                      </div>
                    ) : (
                      detalheCliente.cartoes.map((cartao, idx) => (
                        <div key={idx} className={styles.enderecoCard}>
                          <div className={styles.enderecoHeader}>
                            <CreditCard size={14} />
                            <strong>{cartao.bandeira}</strong>
                            {cartao.principal && (
                              <span className={`${styles.badgeAtivo} ${styles.badgePrincipal}`}>
                                Principal
                              </span>
                            )}
                          </div>
                          <div className={styles.enderecoLinhas}>
                            {cartao.apelido && <>{cartao.apelido}<br /></>}
                            **** **** **** {cartao.ultimos4Digitos}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className={styles.painelDetalhesVazio}>
            <Users size={64} opacity={0.2} />
            <p>Selecione um cliente na lista para ver seus detalhes.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestaoClientes;
export { GestaoClientes };
