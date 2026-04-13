import type {
  IEntregaInputDto,
  IEntregaOutputDto,
  IFreteCalculoInput,
  IFreteCalculoOutput
} from '@/interfaces/entrega';

/**
 * Contrato para o serviço de Entrega/Frete
 * Define os métodos que devem ser implementados
 */
export interface IEntregaService {
  /**
   * Calcula opções de frete para um CEP
   */
  calcularFrete(dados: IFreteCalculoInput): Promise<IFreteCalculoOutput>;

  /**
   * Cadastra entrega para uma venda
   */
  cadastrarEntrega(dados: IEntregaInputDto): Promise<IEntregaOutputDto>;

  /**
   * Consulta entrega por UUID
   */
  consultarEntrega(entregaUuid: string): Promise<IEntregaOutputDto | null>;

  /**
   * Lista entregas por venda
   */
  listarPorVenda(vendaUuid: string): Promise<IEntregaOutputDto[]>;

  /**
   * Registra falha na entrega (Admin)
   */
  registrarFalha(entregaUuid: string): Promise<void>;

  /**
   * Confirma recebimento da entrega (Admin)
   */
  confirmarRecebimento(entregaUuid: string): Promise<void>;

  /**
   * Reagenda entrega com novo endereço (Cliente)
   */
  reagendarEntrega(entregaUuid: string, novoEndereco: object): Promise<void>;
}
