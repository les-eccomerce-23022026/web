import { TelemetriaServiceApi } from './api/telemetriaServiceApi';
import type { ITelemetriaService } from './contracts/telemetriaService';

export const telemetriaService: ITelemetriaService = new TelemetriaServiceApi();
