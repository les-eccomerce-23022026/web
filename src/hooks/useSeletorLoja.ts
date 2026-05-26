import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import type { ILoja } from '@/interfaces/loja';
import type { LojaUsuario } from '@/interfaces/auth';

interface UseSeletorLojaRetorno {
  lojas: LojaUsuario[];
  lojaAtual: LojaUsuario | null;
  carregando: boolean;
  erro: string | null;
  trocarLoja: (lojaUuid: string) => void;
}

/**
 * Hook para gerenciar seleção de loja para admins multi-loja.
 * - Usa dados do token JWT (lojas e loja_uuid_principal) do Redux
 * - Gerencia cookie x-loja-uuid
 * - Retorna lista de lojas e função para trocar
 */
export function useSeletorLoja(): UseSeletorLojaRetorno {
  const { user } = useAppSelector(state => state.auth);
  const [lojaAtual, setLojaAtual] = useState<LojaUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Inicializa lojas do token e loja atual
  useEffect(() => {
    if (!user) {
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro(null);

    const lojasDoToken = user.lojas || [];
    
    // Obtém loja atual do cookie ou usa a principal do token
    if (typeof document !== 'undefined') {
      const cookieLojaUuid = document.cookie
        .split('; ')
        .find(linha => linha.startsWith('x-loja-uuid='))
        ?.split('=')[1];

      if (cookieLojaUuid) {
        const loja = lojasDoToken.find(l => l.loj_uuid === cookieLojaUuid);
        setLojaAtual(loja || lojasDoToken[0] || null);
      } else if (user.loja_uuid_principal) {
        const lojaPrincipal = lojasDoToken.find(l => l.loj_uuid === user.loja_uuid_principal);
        setLojaAtual(lojaPrincipal || lojasDoToken[0] || null);
        // Define cookie com a loja principal se não existir
        document.cookie = `x-loja-uuid=${user.loja_uuid_principal}; path=/; max-age=31536000`;
      } else {
        setLojaAtual(lojasDoToken[0] || null);
      }
    }

    setCarregando(false);
  }, [user]);

  // Função para trocar de loja
  const trocarLoja = (lojaUuid: string) => {
    const lojasDoToken = user?.lojas || [];
    const loja = lojasDoToken.find(l => l.loj_uuid === lojaUuid);
    if (!loja) return;

    // Define cookie x-loja-uuid
    if (typeof document !== 'undefined') {
      document.cookie = `x-loja-uuid=${lojaUuid}; path=/; max-age=31536000`;
    }

    setLojaAtual(loja);

    // Recarrega a página para aplicar a nova loja
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return {
    lojas: user?.lojas || [],
    lojaAtual,
    carregando,
    erro,
    trocarLoja,
  };
}
