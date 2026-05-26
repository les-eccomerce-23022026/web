import type { IPixCobrancaSimulada } from '../interfaces/pagamento';

/** Linha PIX pendente de liquidação via webhook (após POST /pagamentos/selecionar). */
export type PixPendenteInfo = {
  pagamentoUuid: string;
  copiaCola: string;
  qrCodeBase64: string | null;
  expiraEm: string;
  segredoConfirmacao: string;
  valor: number;
};

function montarPixPendente(
  pagamentoUuid: string,
  valor: number,
  pix: IPixCobrancaSimulada,
): PixPendenteInfo {
  return {
    pagamentoUuid,
    copiaCola: pix.copiaCola,
    qrCodeBase64: pix.qrCodeBase64,
    expiraEm: pix.expiraEm,
    segredoConfirmacao: pix.segredoConfirmacao,
    valor,
  };
}

export { montarPixPendente };
