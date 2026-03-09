import { Users, Search, Filter, ShieldCheck, Mail, Phone, Calendar, MapPin, X } from 'lucide-react';
import { useGestaoClientes } from './useGestaoClientes';
import styles from './GestaoClientes.module.css';


function formatarDataDetalhe(isoDate: string) {
  const [ano, mes, dia] = isoDate.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function GestaoClientes() {
  const {
    clientesFiltrados,
    loading,
    filtroBusca,
    setFiltroBusca,
    filtroAtivo,
    setFiltroAtivo,
    clienteSelecionado,
    setClienteSelecionado,
    totalClientes,
    totalAtivos,
  } = useGestaoClientes();

  if (loading) {
    return <div className={styles.loading}><Users size={32} />Carregando clientes...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div>
          <h2>Gestão de Clientes</h2>
          <p className={styles.subtitulo}>RF0024 — Consulta e Listagem de Clientes</p>
        </div>
        <div className={styles.statsPanel}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Total</span>
            <span className={styles.statValue}>{totalClientes}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Ativos</span>
            <span className={styles.statValue}>{totalAtivos}</span>
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
          />
        </div>
        <div className={styles.filtroStatusWrapper}>
          <Filter size={16} className={styles.filtroIcon} />
          <select
            className={styles.selectStatus}
            value={filtroAtivo}
            onChange={(e) => setFiltroAtivo(e.target.value as 'todos' | 'ativo' | 'inativo')}
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Somente Ativos</option>
            <option value="inativo">Somente Inativos</option>
          </select>
        </div>
      </div>

      <div className={styles.gridPrincipal}>
        {/* Lista de Clientes */}
        <div className={styles.listaClientes}>
          {clientesFiltrados.length === 0 ? (
            <div className={styles.vazio}>
              <Users size={48} />
              <p>Nenhum cliente encontrado.</p>
            </div>
          ) : (
            clientesFiltrados.map((cliente) => (
              <div
                key={cliente.uuid}
                className={`${styles.cardCliente} ${clienteSelecionado?.uuid === cliente.uuid ? styles.cardAtivo : ''}`}
                onClick={() => setClienteSelecionado(cliente)}
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

        {/* Painel de Detalhes (Sidepanel) */}
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

            <div className={styles.infoGroup}>
              <div className={styles.perfilBasico}>
                <div className={styles.avatar}>
                  {clienteSelecionado.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className={styles.nomeDetalhe}>{clienteSelecionado.nome}</h4>
                  <div className={styles.rankingBadge}>
                    <ShieldCheck size={14} /> Ranking: Nível {clienteSelecionado.ranking}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.infoGroup}>
              <h5 className={styles.grupoTitulo}>Dados de Contato</h5>
              <div className={styles.infoLinha}>
                <Mail size={16} /> <span>{clienteSelecionado.email}</span>
              </div>
              <div className={styles.infoLinha}>
                <Phone size={16} /> 
                <span>
                  {clienteSelecionado.telefone 
                    ? `(${clienteSelecionado.telefone.ddd}) ${clienteSelecionado.telefone.numero} — ${clienteSelecionado.telefone.tipo}`
                    : 'Não informado'
                  }
                </span>
              </div>
            </div>

            <div className={styles.infoGroup}>
              <h5 className={styles.grupoTitulo}>Dados Pessoais</h5>
              <div className={styles.infoLinha}>
                <span className={styles.infoLabel}>CPF:</span> {clienteSelecionado.cpf}
              </div>
              <div className={styles.infoLinha}>
                <Calendar size={16} /> <span>Nascimento: {formatarDataDetalhe(clienteSelecionado.dataNascimento)}</span>
              </div>
              <div className={styles.infoLinha}>
                <span className={styles.infoLabel}>Gênero:</span> {clienteSelecionado.genero}
              </div>
            </div>

            <div className={styles.infoGroup}>
              <h5 className={styles.grupoTitulo}>Endereços ({clienteSelecionado.enderecosEntrega.length + 1})</h5>
              
              <div className={styles.enderecoCard}>
                <div className={styles.enderecoHeader}>
                  <MapPin size={14} /> <strong>Cobrança Principal</strong>
                </div>
                <div className={styles.enderecoLinhas}>
                  {clienteSelecionado.enderecoCobranca.logradouro}, {clienteSelecionado.enderecoCobranca.numero}
                  {clienteSelecionado.enderecoCobranca.complemento && ` - ${clienteSelecionado.enderecoCobranca.complemento}`}
                  <br />
                  {clienteSelecionado.enderecoCobranca.bairro} — {clienteSelecionado.enderecoCobranca.cidade}/{clienteSelecionado.enderecoCobranca.estado}
                  <br />CEP: {clienteSelecionado.enderecoCobranca.cep}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className={styles.painelDetalhesVazio}>
            <Users size={64} opacity={0.2} />
            <p>Selecione um cliente na lista para ver seus detalhes completos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
