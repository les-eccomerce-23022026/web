import lojaReducer, {
  definirLojaAtiva,
  limparLojaAtiva,
  definirErroLoja,
  buscarLojaAtiva,
  selecionarLojaAtiva,
  selecionarCarregandoLoja,
  selecionarErroLoja,
} from '../lojaSlice';
import type { ILoja } from '@/interfaces/loja';

describe('lojaSlice', () => {
  const estadoInicial = {
    lojaAtiva: null,
    carregando: false,
    erro: null,
  };

  const lojaMock: ILoja = {
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    nome: 'Livraria Exemplo',
    slug: 'livraria-exemplo',
    cnpj: '12.345.678/0001-90',
    ativo: true,
  };

  describe('reducers', () => {
    it('deve retornar estado inicial', () => {
      const estado = lojaReducer(undefined, { type: 'unknown' });
      expect(estado).toEqual(estadoInicial);
    });

    describe('definirLojaAtiva', () => {
      it('deve definir loja ativa', () => {
        const estado = lojaReducer(estadoInicial, definirLojaAtiva(lojaMock));
        expect(estado.lojaAtiva).toEqual(lojaMock);
        expect(estado.erro).toBeNull();
      });

      it('deve limpar erro ao definir loja', () => {
        const estadoComErro = {
          ...estadoInicial,
          erro: 'Erro anterior',
        };
        const estado = lojaReducer(estadoComErro, definirLojaAtiva(lojaMock));
        expect(estado.erro).toBeNull();
      });
    });

    describe('limparLojaAtiva', () => {
      it('deve limpar loja ativa', () => {
        const estadoComLoja = {
          ...estadoInicial,
          lojaAtiva: lojaMock,
        };
        const estado = lojaReducer(estadoComLoja, limparLojaAtiva());
        expect(estado).toEqual(estadoInicial);
      });
    });

    describe('definirErroLoja', () => {
      it('deve definir erro', () => {
        const mensagem = 'Erro ao carregar loja';
        const estado = lojaReducer(estadoInicial, definirErroLoja(mensagem));
        expect(estado.erro).toBe(mensagem);
      });

      it('deve limpar erro quando null', () => {
        const estadoComErro = {
          ...estadoInicial,
          erro: 'Erro anterior',
        };
        const estado = lojaReducer(estadoComErro, definirErroLoja(null));
        expect(estado.erro).toBeNull();
      });
    });
  });

  describe('seletores', () => {
    const estadoComLoja = {
      loja: {
        lojaAtiva: lojaMock,
        carregando: false,
        erro: null,
      },
    };

    it('selecionarLojaAtiva deve retornar loja ativa', () => {
      const resultado = selecionarLojaAtiva(estadoComLoja as any);
      expect(resultado).toEqual(lojaMock);
    });

    it('selecionarCarregandoLoja deve retornar estado de carregamento', () => {
      const resultado = selecionarCarregandoLoja(estadoComLoja as any);
      expect(resultado).toBe(false);
    });

    it('selecionarErroLoja deve retornar erro', () => {
      const resultado = selecionarErroLoja(estadoComLoja as any);
      expect(resultado).toBeNull();
    });
  });

  describe('thunks', () => {
    describe('buscarLojaAtiva', () => {
      it('deve ter tipos corretos', () => {
        // Validar que o thunk foi criado corretamente
        expect(buscarLojaAtiva.pending).toBeDefined();
        expect(buscarLojaAtiva.fulfilled).toBeDefined();
        expect(buscarLojaAtiva.rejected).toBeDefined();
      });

      it('deve definir carregando como true no pending', () => {
        const estado = lojaReducer(
          estadoInicial,
          buscarLojaAtiva.pending('', '550e8400-e29b-41d4-a716-446655440000'),
        );
        expect(estado.carregando).toBe(true);
        expect(estado.erro).toBeNull();
      });

      it('deve definir loja no fulfilled', () => {
        const estado = lojaReducer(
          { ...estadoInicial, carregando: true },
          buscarLojaAtiva.fulfilled(lojaMock, '', '550e8400-e29b-41d4-a716-446655440000'),
        );
        expect(estado.carregando).toBe(false);
        expect(estado.lojaAtiva).toEqual(lojaMock);
        expect(estado.erro).toBeNull();
      });

      it('deve definir erro no rejected', () => {
        const mensagem = 'Erro ao carregar loja';
        const estado = lojaReducer(
          { ...estadoInicial, carregando: true },
          buscarLojaAtiva.rejected(null, '', '550e8400-e29b-41d4-a716-446655440000', mensagem),
        );
        expect(estado.carregando).toBe(false);
        expect(estado.erro).toBe(mensagem);
      });
    });
  });
});
