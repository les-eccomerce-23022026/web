import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Settings } from 'lucide-react';
import styles from './style.module.css';
import enderecoStyles from '../../../components/FinalizarCompra/Entrega/style.module.css';
import { EnderecoEntregaCard } from '../../../components/FinalizarCompra/Entrega';
import { Modal } from '../../../components/Comum/Modal';
import type { ICheckoutInfo } from '../../../interfaces/checkout';

type Props = {
  data: ICheckoutInfo;
  enderecoSelecionado: string | null;
  enderecoCobrancaSelecionado?: string | null;
  onSelectEndereco: (uuid: string | null) => void;
  onSelectEnderecoCobranca?: (uuid: string | null) => void;
};

export const FinalizarCompraEnderecoCard = ({
  data,
  enderecoSelecionado,
  enderecoCobrancaSelecionado,
  onSelectEndereco,
  onSelectEnderecoCobranca,
}: Props) => {
  const temLista = data.enderecosDisponiveis && data.enderecosDisponiveis.length > 0;
  const [modalAberto, setModalAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'entrega' | 'cobranca'>('entrega');

  if (temLista) {
    return (
      <div className={`card ${styles['checkout-card-spaced']}`}>
        <div className={styles['endereco-header']}>
          <h3>Endereços</h3>
          <button
            className={`btn-secondary ${styles['btn-configurar-enderecos']}`}
            onClick={() => setModalAberto(true)}
            data-cy="btn-configurar-enderecos"
          >
            <Settings size={16} />
            Configurar Cobrança e Entrega
          </button>
        </div>
        <EnderecoEntregaCard
          enderecos={data.enderecosDisponiveis!}
          selecionado={enderecoSelecionado}
          onSelect={onSelectEndereco}
        />
        {enderecoSelecionado && (
          <p className={styles['endereco-selecionado-info']}>
            ✓ Endereço selecionado para entrega
          </p>
        )}
        {enderecoCobrancaSelecionado && (
          <p className={styles['endereco-selecionado-info']}>
            ✓ Endereço selecionado para cobrança
          </p>
        )}

        <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} title="Configurar Endereços">
          <div className={styles['modal-tabs']}>
            <button
              className={`${styles['tab-btn']} ${abaAtiva === 'entrega' ? styles['tab-btn-ativo'] : ''}`}
              onClick={() => setAbaAtiva('entrega')}
            >
              Endereço de Entrega
            </button>
            <button
              className={`${styles['tab-btn']} ${abaAtiva === 'cobranca' ? styles['tab-btn-ativo'] : ''}`}
              onClick={() => setAbaAtiva('cobranca')}
            >
              Endereço de Cobrança
            </button>
          </div>

          {abaAtiva === 'entrega' && (
            <div className={styles['tab-content']}>
              <EnderecoEntregaCard
                enderecos={data.enderecosDisponiveis!}
                selecionado={enderecoSelecionado}
                onSelect={(uuid: string) => {
                  onSelectEndereco(uuid);
                  setModalAberto(false);
                }}
              />
            </div>
          )}

          {abaAtiva === 'cobranca' && onSelectEnderecoCobranca && (
            <div className={styles['tab-content']}>
              <EnderecoEntregaCard
                enderecos={data.enderecosDisponiveis!}
                selecionado={enderecoCobrancaSelecionado}
                onSelect={(uuid: string) => {
                  onSelectEnderecoCobranca(uuid);
                  setModalAberto(false);
                }}
              />
            </div>
          )}

          {abaAtiva === 'cobranca' && !onSelectEnderecoCobranca && (
            <div className={styles['tab-content']}>
              <p className={styles['info-msg']}>
                Endereço de cobrança não configurado. Será usado o mesmo endereço de entrega.
              </p>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  return (
    <div className={`card ${styles['checkout-card-spaced']}`}>
      <h3>Endereço de Entrega</h3>
      <div className={enderecoStyles['sem-enderecos']} data-cy="checkout-no-addresses">
        <MapPin size={48} strokeWidth={1.5} />
        <p>Nenhum endereço cadastrado</p>
        <span>É necessário cadastrar um endereço para continuar a compra.</span>
        <Link
          href="/minha-conta"
          className="btn-secondary"
          data-cy="checkout-add-address-link"
        >
          Ir ao perfil para cadastrar endereço
        </Link>
      </div>
    </div>
  );
};
