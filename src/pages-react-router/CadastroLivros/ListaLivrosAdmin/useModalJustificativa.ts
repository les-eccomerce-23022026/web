import { useState } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { alternarStatusLivro } from '../../../store/slices/livroSlice';

export function useModalJustificativa() {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [livroPendenteStatus, setLivroPendenteStatus] = useState<string | null>(null);
  const [justificativaTexto, setJustificativaTexto] = useState('');
  const [justificativaCategoria, setJustificativaCategoria] = useState('');
  const [erroModal, setErroModal] = useState<string | null>(null);

  const solicitarTrocaStatus = (uuid: string) => {
    setLivroPendenteStatus(uuid);
    setJustificativaTexto('');
    setJustificativaCategoria('');
    setModalOpen(true);
  };

  const confirmarTrocaStatus = () => {
    if (!justificativaTexto || !justificativaCategoria) {
      setErroModal("Para prosseguir preencha a categoria e justifique a mudança.");
      return;
    }
    
    if (livroPendenteStatus) {
      dispatch(alternarStatusLivro({ 
        uuid: livroPendenteStatus, 
        justificativa: justificativaTexto, 
        categoriaInativacao: justificativaCategoria 
      }));
    }
    setModalOpen(false);
    setLivroPendenteStatus(null);
    setErroModal(null);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setLivroPendenteStatus(null);
    setErroModal(null);
  };

  return {
    modalOpen,
    livroPendenteStatus,
    justificativaTexto,
    setJustificativaTexto,
    justificativaCategoria,
    setJustificativaCategoria,
    erroModal,
    solicitarTrocaStatus,
    confirmarTrocaStatus,
    fecharModal,
  };
}
