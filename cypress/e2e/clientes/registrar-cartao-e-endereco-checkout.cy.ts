/**
 * CDU003 — Registrar cartão e endereço (E2E com tela Minha Conta)
 */

import {
  cadastrarCartaoMinhaContaUi,
  cadastrarEnderecoMinhaContaUi,
  configurarAmbienteEntrega7Ui,
  autenticarClienteDadosTesteUi,
} from '../../support/helpers/uiEntrega7Helpers';
import { ProfilePage } from '../../support/pages/user/ProfilePage';

describe('Clientes — Registrar Cartão e Endereço (CDU003)', () => {
  beforeEach(() => {
    configurarAmbienteEntrega7Ui();
    autenticarClienteDadosTesteUi();
  });

  it('deve cadastrar novo endereço em /minha-conta e listar na aba de endereços', () => {
    cadastrarEnderecoMinhaContaUi({
      logradouro: 'Avenida Paulista',
      numero: '1578',
      bairro: 'Bela Vista',
      cep: '01310-100',
      cidade: 'São Paulo',
      estado: 'SP',
    });
    cy.contains('Avenida Paulista').should('be.visible');
  });

  it('deve cadastrar novo cartão em /minha-conta e exibir na lista', () => {
    const nomeImpresso = `CLIENTE UI ${Date.now()}`;
    cadastrarCartaoMinhaContaUi({
      numero: '4444555566667777',
      nome: nomeImpresso,
      bandeira: 'Visa',
      validade: '12/2030',
      cvv: '123',
    });
    cy.contains(nomeImpresso).should('be.visible');
    ProfilePage.navigateToTab('cartoes');
    cy.contains('7777').should('be.visible');
  });
});
