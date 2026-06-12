import type { ITelemetriaService } from '../contracts/telemetriaService';

// Endpoint configurável por ambiente. Sem a variável definida a telemetria fica
// desabilitada — evitando o fetch que gera ERR_CONNECTION_REFUSED no console
// quando o serviço de ingestão não está rodando.
const TELEMETRIA_ENDPOINT = process.env.NEXT_PUBLIC_TELEMETRIA_ENDPOINT ?? '';

export class TelemetriaServiceApi implements ITelemetriaService {
  async enviarEvento(evento: string, dados?: Record<string, unknown>): Promise<void> {
    if (!TELEMETRIA_ENDPOINT) {
      // Telemetria não configurada neste ambiente: no-op silencioso.
      return;
    }

    try {
      await fetch(TELEMETRIA_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          evento,
          timestamp: new Date().toISOString(),
          ...dados,
        }),
      });
    } catch (error) {
      // Telemetria é opcional: registra em nível debug para não poluir o console.
      console.debug('[Telemetria] Serviço indisponível:', error);
    }
  }
}
