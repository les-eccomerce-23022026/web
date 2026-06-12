export interface ITelemetriaService {
  enviarEvento(evento: string, dados?: Record<string, unknown>): Promise<void>;
}
