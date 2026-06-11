import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Settings, Plus } from 'lucide-react';
import styles from './style.module.css';
import enderecoStyles from '../../../components/FinalizarCompra/Entrega/style.module.css';
import { EnderecoEntregaCard } from '../../../components/FinalizarCompra/Entrega';
import { Modal } from '../../../components/Comum/Modal';
import { AutenticacaoClienteEnderecoForm } from '../../../pages-react-router/CadastroClientes/AutenticacaoCliente/AutenticacaoClienteEnderecoForm';
import { ClienteService } from '../../../services/clienteService';
import type { ICheckoutInfo } from '../../../interfaces/checkout';
import type { IEnderecoCliente } from '../../../interfaces/pagamento';

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
  const [modalNovoEndereco, setModalNovoEndereco] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState<Omit<IEnderecoCliente, 'uuid'>>({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    tipo: 'entrega',
    principal: false,
    apelido: '',
  });
  const [salvandoEndereco, setSalvandoEndereco] = useState(false);
  const [erroEndereco, setErroEndereco] = useState<string | null>(null);
  const [listaAtualizada, setListaAtualizada] = useState<IEnderecoCliente[]>(data.enderecosDisponiveis || []);

  const handleAdicionarEndereco = async () => {
    if (!novoEndereco.logradouro || !novoEndereco.numero || !novoEndereco.bairro || !novoEndereco.cidade || !novoEndereco.estado || !novoEndereco.cep) {
      setErroEndereco('Preencha todos os campos obrigatórios');
      return;
    }
    setSalvandoEndereco(true);
    setErroEndereco(null);
    try {
      const enderecosAtualizados = await ClienteService.adicionarEndereco(novoEndereco);
      setListaAtualizada(enderecosAtualizados);
      setModalNovoEndereco(false);
      setNovoEndereco({
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        tipo: 'entrega',
        principal: false,
        apelido: '',
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao adicionar endereço';
      setErroEndereco(msg);
    } finally {
      setSalvandoEndereco(false);
    }
  };

  if (temLista || listaAtualizada.length > 0) {
    const enderecosParaExibir = listaAtualizada.length > 0 ? listaAtualizada : data.enderecosDisponiveis;
    return (
      <div className={`card ${styles['checkout-card-spaced']}`} data-cy="checkout-addresses">
        <div className={styles['endereco-header']}>
          <h3 data-cy="checkout-addresses-title">Endereços</h3>
          <div className={styles['endereco-header-actions']}>
            <button
              className={`btn-secondary ${styles['btn-configurar-enderecos']}`}
              onClick={() => setModalAberto(true)}
              data-cy="btn-configurar-enderecos"
            >
              <Settings size={16} />
              Configurar
            </button>
            <button
              className="btn-secondary"
              onClick={() => setModalNovoEndereco(true)}
              data-cy="checkout-add-new-address"
            >
              <Plus size={16} />
              Novo Endereço
            </button>
          </div>
        </div>
        <EnderecoEntregaCard
          enderecos={enderecosParaExibir!}
          selecionado={enderecoSelecionado}
          onSelect={onSelectEndereco}
          onAdd={() => setModalNovoEndereco(true)}
        />
        {enderecoSelecionado && (
          <p className={styles['endereco-selecionado-info']} data-cy="checkout-address-selected">
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
                enderecos={enderecosParaExibir!}
                selecionado={enderecoSelecionado}
                onSelect={(uuid: string) => {
                  onSelectEndereco(uuid);
                  setModalAberto(false);
                }}
                onAdd={() => setModalNovoEndereco(true)}
              />
            </div>
          )}

          {abaAtiva === 'cobranca' && onSelectEnderecoCobranca && (
            <div className={styles['tab-content']}>
              <EnderecoEntregaCard
                enderecos={enderecosParaExibir!}
                selecionado={enderecoCobrancaSelecionado}
                onSelect={(uuid: string) => {
                  onSelectEnderecoCobranca(uuid);
                  setModalAberto(false);
                }}
                onAdd={() => setModalNovoEndereco(true)}
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

        <Modal
          isOpen={modalNovoEndereco}
          onClose={() => setModalNovoEndereco(false)}
          title="Adicionar Novo Endereço"
        >
          <div className={styles['modal-novo-endereco']} data-cy="checkout-new-address-form">
            {erroEndereco && (
              <div className={styles['error-banner']} data-cy="address-error">
                {erroEndereco}
              </div>
            )}
            <AutenticacaoClienteEnderecoForm
              titulo="Dados do Endereço"
              endereco={novoEndereco}
              onChange={setNovoEndereco}
            />
            <div className={styles['modal-novo-endereco-acoes']}>
              <button
                className="btn-secondary"
                onClick={() => setModalNovoEndereco(false)}
                disabled={salvandoEndereco}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleAdicionarEndereco}
                disabled={salvandoEndereco}
                data-cy="checkout-save-address-button"
              >
                {salvandoEndereco ? 'Salvando...' : 'Salvar Endereço'}
              </button>
            </div>
          </div>
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
