import type { useLoginArea } from './useLoginArea';

export type LoginAreaLoginState = ReturnType<typeof useLoginArea>['loginState'];
export type LoginAreaRegisterState = ReturnType<typeof useLoginArea>['registerState'];
export type LoginAreaDominios = ReturnType<typeof useLoginArea>['dominios'];
