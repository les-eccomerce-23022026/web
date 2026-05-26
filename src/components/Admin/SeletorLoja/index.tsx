'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSeletorLoja } from '@/hooks/useSeletorLoja';
import type { LojaUsuario } from '@/interfaces/auth';
import styles from './seletorLoja.module.css';

/**
 * Componente SeletorLoja para admins multi-loja.
 * - Exibe dropdown apenas se admin tiver múltiplas lojas
 * - Mostra loja atual selecionada (pelo UUID)
 * - Permite trocar de loja com recarregamento de página
 * - Gerencia cookie x-loja-uuid
 */
export const SeletorLoja = () => {
  const { lojas, lojaAtual, carregando, erro, trocarLoja } = useSeletorLoja();
  const [aberto, setAberto] = useState(false);

  // Não exibe seletor se há apenas uma loja ou está carregando
  if (carregando || lojas.length <= 1) {
    return null;
  }

  // Não exibe se houver erro ou nenhuma loja
  if (erro || !lojaAtual) {
    return null;
  }

  const handleMudarLoja = (lojaUuid: string) => {
    setAberto(false);
    trocarLoja(lojaUuid);
  };

  return (
    <div className={styles.seletorContainer}>
      <button
        className={styles.botaoSeletor}
        onClick={() => setAberto(!aberto)}
        data-cy="seletor-loja-botao"
        title={`Loja atual: ${lojaAtual.loj_uuid}`}
      >
        <span className={styles.lojaAtualNome}>{lojaAtual.loj_uuid}</span>
        <ChevronDown size={18} className={`${styles.icone} ${aberto ? styles.iconAberto : ''}`} />
      </button>

      {/* Dropdown com lista de lojas */}
      {aberto && (
        <div className={styles.dropdown} data-cy="seletor-loja-dropdown">
          <ul className={styles.listaLojas}>
            {lojas.map((loja: LojaUsuario) => (
              <li key={loja.loj_uuid}>
                <button
                  className={`${styles.opcaoLoja} ${lojaAtual.loj_uuid === loja.loj_uuid ? styles.opcaoAtiva : ''}`}
                  onClick={() => handleMudarLoja(loja.loj_uuid)}
                  data-cy={`seletor-loja-opcao-${loja.loj_uuid}`}
                >
                  {loja.loj_uuid}
                  {lojaAtual.loj_uuid === loja.loj_uuid && <span className={styles.marcaSelecionada}>✓</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
