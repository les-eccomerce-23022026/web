'use client';

import { useGerenciarLojas } from './useGerenciarLojas';
import styles from './style.module.css';
import { GerenciarLojasTabela } from './GerenciarLojasTabela';
import { GerenciarLojasModalFormulario } from './GerenciarLojasModalFormulario';
import { GerenciarLojasModalSalvar } from './GerenciarLojasModalSalvar';
import { GerenciarLojasModalExclusao } from './GerenciarLojasModalExclusao';
import type { IFiltroStatus } from './useGerenciarLojas';

const OPCOES_STATUS: { valor: IFiltroStatus; label: string }[] = [
  { valor: 'todos', label: 'Todos os status' },
  { valor: 'ativo', label: 'Ativas' },
  { valor: 'inativo', label: 'Inativas' },
];

function GerenciarLojas() {
  const h = useGerenciarLojas();

  return (
    <div className={styles.pageContent}>
      {/* Header com título e botão de criar */}
      <header className={styles.headerActions}>
        <h3 className={styles.pageTitle}>Gerenciar Lojas</h3>
        <button
          className="btn-primary"
          onClick={h.startCreate}
          data-cy="btn-nova-loja"
        >
          Nova Loja
        </button>
      </header>

      {/* Indicador de total */}
      {!h.isLoading && (
        <p className={styles.lojaHeaderInfo} data-cy="info-total-lojas">
          {h.total} {h.total === 1 ? 'loja cadastrada' : 'lojas cadastradas'}
          {h.totalAtivas > 0 && ` · ${h.totalAtivas} ativa${h.totalAtivas !== 1 ? 's' : ''}`}
        </p>
      )}

      {/* Mensagem de feedback da página */}
      {h.pageMessage && (
        <p
          className={
            h.pageMessageType === 'success' ? styles.messageSuccess : styles.errorMessage
          }
          data-cy="page-message"
        >
          {h.pageMessage}
        </p>
      )}

      {/* Filtros */}
      <div className={styles.filtrosContainer}>
        <div className={styles.filtroInput}>
          <input
            type="text"
            placeholder="Buscar por nome ou CNPJ..."
            value={h.filtroNome}
            onChange={(e) => h.handleFiltroNomeChange(e.target.value)}
            data-cy="input-filtro-loja"
          />
        </div>
        <select
          className={styles.filtroStatus}
          value={h.filtroStatus}
          onChange={(e) => h.handleFiltroStatusChange(e.target.value as IFiltroStatus)}
          data-cy="select-filtro-status"
        >
          {OPCOES_STATUS.map((op) => (
            <option key={op.valor} value={op.valor}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabela de lojas */}
      <GerenciarLojasTabela
        lojas={h.lojas}
        isLoading={h.isLoading}
        onEdit={h.startEdit}
        onToggle={h.triggerDelete}
      />

      {/* Paginação */}
      {h.totalPaginas > 1 && (
        <div className={styles.paginacao}>
          <button
            className={styles.paginacaoBotao}
            onClick={() => h.setPaginaAtual(h.paginaAtual - 1)}
            disabled={h.paginaAtual === 1 || h.isLoading}
            data-cy="btn-pagina-anterior"
          >
            ← Anterior
          </button>
          <span className={styles.paginacaoInfo} data-cy="info-paginacao">
            Página {h.paginaAtual} de {h.totalPaginas}
          </span>
          <button
            className={styles.paginacaoBotao}
            onClick={() => h.setPaginaAtual(h.paginaAtual + 1)}
            disabled={h.paginaAtual === h.totalPaginas || h.isLoading}
            data-cy="btn-proxima-pagina"
          >
            Próxima →
          </button>
        </div>
      )}

      {/* Modal de formulário */}
      <GerenciarLojasModalFormulario
        isOpen={h.showForm}
        editingLoja={h.editingLoja}
        form={h.form}
        modalMessage={h.modalMessage}
        modalMessageType={h.modalMessageType}
        isConfirmModalOpen={h.isConfirmModalOpen}
        onClose={h.cancelForm}
        onTriggerSaveConfirm={h.triggerSaveConfirm}
        onFieldChange={h.handleFieldChange}
        onGerarSlug={h.gerarSlugDoNome}
      />

      {/* Modal de confirmação de salvamento */}
      <GerenciarLojasModalSalvar
        isOpen={h.isConfirmModalOpen}
        editingLoja={h.editingLoja}
        formNome={h.form.nome}
        modalMessage={h.modalMessage}
        modalMessageType={h.modalMessageType}
        onClose={() => h.setIsConfirmModalOpen(false)}
        onSave={h.handleSave}
      />

      {/* Modal de inativação/ativação */}
      <GerenciarLojasModalExclusao
        isOpen={h.isDeleteModalOpen}
        lojaToToggle={h.lojaToToggle}
        onClose={() => h.setIsDeleteModalOpen(false)}
        onConfirm={h.handleDelete}
      />
    </div>
  );
}

export default GerenciarLojas;
export { GerenciarLojas };
