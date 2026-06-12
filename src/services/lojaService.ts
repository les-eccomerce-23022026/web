import { LojaServiceApi } from './api/lojaServiceApi';
import type { ILojaService } from './contracts/lojaService';

export const lojaService: ILojaService = new LojaServiceApi();
