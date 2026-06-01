/**
 * Testes E2E da Página Admin — Ações do Cliente
 * Foco: Edição, inativação, reativação e reset de senha
 */

import { AdminClientesPage } from '../../support/pages/admin/AdminClientesPage';
import { TIMEOUT } from '../../support/constants';

describe('Admin — Ações do Cliente', () => {
  beforeEach(() => {
    cy.autenticarAdministradorViaApi();
  });

  describe('Botões de Ação', () => {
    it('deve ter botão para editar cliente', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.editarButton.should('be.visible');
      });
    });

    it('deve ter botão para inativar cliente', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.inativarButton.should('be.visible');
      });
    });

    it('deve ter botão para resetar senha', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.resetarSenhaButton.should('be.visible');
      });
    });

    it('deve ter botão para reativar cliente inativo', () => {
      AdminClientesPage.visitar();
      
      // Procura por cliente inativo
      AdminClientesPage.tabelaLinhas.then(($rows) => {
        $rows.each((index, row) => {
          cy.wrap(row).find(AdminClientesPage.statusInativo.selector).then(($status) => {
            if ($status.length > 0) {
              cy.wrap(row).within(() => {
                AdminClientesPage.reativarButton.should('be.visible');
              });
              return false; // Para o loop
            }
          });
        });
      });
    });
  });

  describe('Edição de Cliente', () => {
    it('deve abrir modal de edição', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.editarButton.click();
      });
      
      AdminClientesPage.edicaoModal.should('be.visible');
    });

    it('deve exibir campos de edição corretamente', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.editarButton.click();
      });
      
      AdminClientesPage.edicaoModal.should('be.visible');
      AdminClientesPage.edicaoNomeInput.should('be.visible');
      AdminClientesPage.edicaoEmailInput.should('be.visible');
      AdminClientesPage.edicaoTelefoneInput.should('be.visible');
      AdminClientesPage.edicaoDataNascimentoInput.should('be.visible');
      AdminClientesPage.edicaoGeneroSelect.should('be.visible');
    });

    it('deve ter botões de salvar e cancelar', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.editarButton.click();
      });
      
      AdminClientesPage.edicaoSalvarButton.should('be.visible');
      AdminClientesPage.edicaoCancelarButton.should('be.visible');
    });

    it('deve permitir editar nome do cliente', () => {
      AdminClientesPage.visitar();
      
      const novoNome = 'Cliente Editado Teste';
      
      AdminClientesPage.editarCliente(0, { nome: novoNome });
      
      AdminClientesPage.mensagemSucesso.should('be.visible');
      AdminClientesPage.mensagemSucesso.should('contain.text', 'atualizado');
    });

    it('deve permitir editar email do cliente', () => {
      AdminClientesPage.visitar();
      
      const novoEmail = 'editado@teste.com';
      
      AdminClientesPage.editarCliente(0, { email: novoEmail });
      
      AdminClientesPage.mensagemSucesso.should('be.visible');
    });

    it('deve permitir editar telefone do cliente', () => {
      AdminClientesPage.visitar();
      
      const novoTelefone = '(11) 99999-8888';
      
      AdminClientesPage.editarCliente(0, { telefone: novoTelefone });
      
      AdminClientesPage.mensagemSucesso.should('be.visible');
    });

    it('deve permitir editar data de nascimento', () => {
      AdminClientesPage.visitar();
      
      const novaData = '15/03/1990';
      
      AdminClientesPage.editarCliente(0, { dataNascimento: novaData });
      
      AdminClientesPage.mensagemSucesso.should('be.visible');
    });

    it('deve permitir editar gênero', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.editarCliente(0, { genero: 'Masculino' });
      
      AdminClientesPage.mensagemSucesso.should('be.visible');
    });

    it('deve permitir editar múltiplos campos', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.editarCliente(0, {
        nome: 'Cliente Multi Edição',
        email: 'multi@edicao.com',
        telefone: '(11) 7777-5555',
        genero: 'Feminino'
      });
      
      AdminClientesPage.mensagemSucesso.should('be.visible');
    });

    it('deve cancelar edição ao clicar em cancelar', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.editarButton.click();
      });
      
      AdminClientesPage.edicaoModal.should('be.visible');
      AdminClientesPage.edicaoCancelarButton.click();
      
      AdminClientesPage.edicaoModal.should('not.exist');
    });

    it('deve validar campos obrigatórios', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.editarButton.click();
      });
      
      // Limpa campo obrigatório e tenta salvar
      AdminClientesPage.edicaoNomeInput.clear();
      AdminClientesPage.edicaoSalvarButton.click();
      
      // Deve exibir mensagem de erro
      AdminClientesPage.mensagemErro.should('be.visible');
    });

    it('deve validar formato de email', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.editarButton.click();
      });
      
      AdminClientesPage.edicaoEmailInput.clear().type('email-invalido');
      AdminClientesPage.edicaoSalvarButton.click();
      
      AdminClientesPage.mensagemErro.should('be.visible');
      AdminClientesPage.mensagemErro.should('contain.text', 'email');
    });
  });

  describe('Inativação de Cliente', () => {
    it('deve abrir modal de inativação', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.inativarButton.click();
      });
      
      AdminClientesPage.inativacaoModal.should('be.visible');
    });

    it('deve exibir campo de motivo da inativação', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.inativarButton.click();
      });
      
      AdminClientesPage.inativacaoMotivoTextarea.should('be.visible');
    });

    it('deve ter botões de confirmar e cancelar', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.inativarButton.click();
      });
      
      AdminClientesPage.inativacaoConfirmarButton.should('be.visible');
      AdminClientesPage.inativacaoCancelarButton.should('be.visible');
    });

    it('deve permitir inativar cliente com motivo', () => {
      AdminClientesPage.visitar();
      
      const motivo = 'Inativado para testes automatizados';
      
      AdminClientesPage.inativarCliente(0, motivo);
      
      AdminClientesPage.mensagemSucesso.should('be.visible');
      AdminClientesPage.mensagemSucesso.should('contain.text', 'inativado');
    });

    it('deve cancelar inativação ao clicar em cancelar', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.inativarButton.click();
      });
      
      AdminClientesPage.inativacaoModal.should('be.visible');
      AdminClientesPage.inativacaoCancelarButton.click();
      
      AdminClientesPage.inativacaoModal.should('not.exist');
    });

    it('deve exigir motivo para inativação', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.inativarButton.click();
      });
      
      // Tenta confirmar sem motivo
      AdminClientesPage.inativacaoConfirmarButton.click();
      
      // Deve exigir motivo
      AdminClientesPage.mensagemErro.should('be.visible');
      AdminClientesPage.mensagemErro.should('contain.text', 'motivo');
    });

    it('deve validar tamanho mínimo do motivo', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.inativarButton.click();
      });
      
      // Motivo muito curto
      AdminClientesPage.inativacaoMotivoTextarea.type('ABC');
      AdminClientesPage.inativacaoConfirmarButton.click();
      
      AdminClientesPage.mensagemErro.should('be.visible');
    });
  });

  describe('Reativação de Cliente', () => {
    it('deve permitir reativar cliente inativo', () => {
      AdminClientesPage.visitar();
      
      // Primeiro inativa um cliente
      AdminClientesPage.inativarCliente(0, 'Teste de inativação');
      
      // Depois reativa
      AdminClientesPage.reativarCliente(0);
      
      AdminClientesPage.mensagemSucesso.should('be.visible');
      AdminClientesPage.mensagemSucesso.should('contain.text', 'reativado');
    });

    it('não deve mostrar botão reativar para cliente ativo', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.statusAtivo.should('be.visible');
        AdminClientesPage.reativarButton.should('not.exist');
      });
    });

    it('deve mostrar botão reativar apenas para cliente inativo', () => {
      AdminClientesPage.visitar();
      
      // Procura por cliente inativo
      AdminClientesPage.tabelaLinhas.then(($rows) => {
        let encontrouInativo = false;
        
        $rows.each((index, row) => {
          if (!encontrouInativo) {
            cy.wrap(row).find(AdminClientesPage.statusInativo.selector).then(($status) => {
              if ($status.length > 0) {
                encontrouInativo = true;
                cy.wrap(row).within(() => {
                  AdminClientesPage.reativarButton.should('be.visible');
                  AdminClientesPage.inativarButton.should('not.exist');
                });
              }
            });
          }
        });
      });
    });
  });

  describe('Reset de Senha', () => {
    it('deve abrir modal de reset de senha', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.resetarSenhaButton.click();
      });
      
      AdminClientesPage.resetSenhaModal.should('be.visible');
    });

    it('deve exibir campos de nova senha', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.resetarSenhaButton.click();
      });
      
      AdminClientesPage.resetSenhaNovaSenhaInput.should('be.visible');
      AdminClientesPage.resetSenhaConfirmarSenhaInput.should('be.visible');
    });

    it('deve ter botões de confirmar e cancelar', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.resetarSenhaButton.click();
      });
      
      AdminClientesPage.resetSenhaConfirmarButton.should('be.visible');
      AdminClientesPage.resetSenhaCancelarButton.should('be.visible');
    });

    it('deve permitir resetar senha com dados válidos', () => {
      AdminClientesPage.visitar();
      
      const novaSenha = 'NovaSenha123!';
      const confirmarSenha = 'NovaSenha123!';
      
      AdminClientesPage.resetarSenhaCliente(0, novaSenha, confirmarSenha);
      
      AdminClientesPage.mensagemSucesso.should('be.visible');
      AdminClientesPage.mensagemSucesso.should('contain.text', 'senha');
    });

    it('deve cancelar reset ao clicar em cancelar', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.resetarSenhaButton.click();
      });
      
      AdminClientesPage.resetSenhaModal.should('be.visible');
      AdminClientesPage.resetSenhaCancelarButton.click();
      
      AdminClientesPage.resetSenhaModal.should('not.exist');
    });

    it('deve validar que senhas coincidem', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.resetarSenhaButton.click();
      });
      
      AdminClientesPage.resetSenhaNovaSenhaInput.type('Senha123!');
      AdminClientesPage.resetSenhaConfirmarSenhaInput.type('SenhaDiferente!');
      AdminClientesPage.resetSenhaConfirmarButton.click();
      
      AdminClientesPage.mensagemErro.should('be.visible');
      AdminClientesPage.mensagemErro.should('contain.text', 'senhas');
    });

    it('deve validar força da senha', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.resetarSenhaButton.click();
      });
      
      // Senha muito fraca
      AdminClientesPage.resetSenhaNovaSenhaInput.type('123');
      AdminClientesPage.resetSenhaConfirmarSenhaInput.type('123');
      AdminClientesPage.resetSenhaConfirmarButton.click();
      
      AdminClientesPage.mensagemErro.should('be.visible');
      AdminClientesPage.mensagemErro.should('contain.text', 'fraca');
    });

    it('deve exigir confirmação de senha', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.resetarSenhaButton.click();
      });
      
      AdminClientesPage.resetSenhaNovaSenhaInput.type('SenhaValida123!');
      AdminClientesPage.resetSenhaConfirmarButton.click();
      
      AdminClientesPage.mensagemErro.should('be.visible');
      AdminClientesPage.mensagemErro.should('contain.text', 'confirmação');
    });

    it('deve validar tamanho mínimo da senha', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.resetarSenhaButton.click();
      });
      
      AdminClientesPage.resetSenhaNovaSenhaInput.type('12345');
      AdminClientesPage.resetSenhaConfirmarSenhaInput.type('12345');
      AdminClientesPage.resetSenhaConfirmarButton.click();
      
      AdminClientesPage.mensagemErro.should('be.visible');
    });
  });

  describe('Integração entre Ações', () => {
    it('deve manter dados atualizados após edição', () => {
      AdminClientesPage.visitar();
      
      const novoNome = 'Cliente Atualizado';
      
      AdminClientesPage.editarCliente(0, { nome: novoNome });
      
      // Verifica que nome foi atualizado na tabela
      AdminClientesPage.tabelaLinhas.first().should('contain.text', novoNome);
    });

    it('deve atualizar status após inativação', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.inativarCliente(0, 'Teste de integração');
      
      // Verifica que status foi atualizado
      AdminClientesPage.verificarStatusDoCliente(0, 'Inativo');
    });

    it('deve atualizar status após reativação', () => {
      AdminClientesPage.visitar();
      
      // Primeiro inativa
      AdminClientesPage.inativarCliente(0, 'Teste de reativação');
      
      // Depois reativa
      AdminClientesPage.reativarCliente(0);
      
      // Verifica que status foi atualizado
      AdminClientesPage.verificarStatusDoCliente(0, 'Ativo');
    });

    it('deve permitir múltiplas ações no mesmo cliente', () => {
      AdminClientesPage.visitar();
      
      // Edita
      AdminClientesPage.editarCliente(0, { nome: 'Cliente Múltiplas Ações' });
      
      // Inativa
      AdminClientesPage.inativarCliente(0, 'Teste múltiplas ações');
      
      // Reativa
      AdminClientesPage.reativarCliente(0);
      
      // Reset de senha
      AdminClientesPage.resetarSenhaCliente(0, 'NovaSenha456!', 'NovaSenha456!');
      
      AdminClientesPage.mensagemSucesso.should('be.visible');
    });
  });

  describe('Segurança e Permissões', () => {
    it('não deve permitir ações sem autenticação', () => {
      // Remove autenticação
      cy.clearCookies();
      cy.clearLocalStorage();
      
      AdminClientesPage.visitar();
      
      // Deve redirecionar para login
      cy.url().should('include', '/login');
    });

    it('deve registrar log das ações', () => {
      AdminClientesPage.visitar();
      
      // Intercepta requisição para verificar log
      cy.intercept('POST', '/api/admin/logs').as('logAction');
      
      AdminClientesPage.editarCliente(0, { nome: 'Teste Log' });
      
      cy.wait('@logAction').then((interception) => {
        expect(interception.request.body).to.have.property('action');
        expect(interception.request.body).to.have.property('clientId');
      });
    });

    it('deve validar permissões específicas', () => {
      AdminClientesPage.visitar();
      
      // Simula usuário sem permissão de edição
      cy.intercept('GET', '/api/admin/permissions', {
        body: { canEdit: false, canInactivate: true, canResetPassword: false }
      }).as('getPermissions');
      
      cy.reload();
      cy.wait('@getPermissions');
      
      // Botão editar não deve aparecer
      AdminClientesPage.editarButton.should('not.exist');
      // Botão inativar deve aparecer
      AdminClientesPage.inativarButton.should('be.visible');
      // Botão reset senha não deve aparecer
      AdminClientesPage.resetarSenhaButton.should('not.exist');
    });
  });

  describe('Performance e Confiabilidade', () => {
    it('deve executar ações rapidamente', () => {
      AdminClientesPage.visitar();
      
      const startTime = Date.now();
      
      AdminClientesPage.editarCliente(0, { nome: 'Performance Test' });
      
      const endTime = Date.now();
      const actionTime = endTime - startTime;
      
      // Ação deve completar em menos de 5 segundos
      expect(actionTime).to.be.lessThan(5000);
    });

    it('deve tratar erro de rede', () => {
      AdminClientesPage.visitar();
      
      // Simula erro de rede
      cy.intercept('PUT', '/api/admin/clientes/*', {
        statusCode: 0,
        body: {}
      }).as('networkError');
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.editarButton.click();
      });
      
      AdminClientesPage.edicaoSalvarButton.click();
      
      cy.wait('@networkError');
      AdminClientesPage.mensagemErro.should('be.visible');
      AdminClientesPage.mensagemErro.should('contain.text', 'conexão');
    });

    it('deve tratar erro de servidor', () => {
      AdminClientesPage.visitar();
      
      // Simula erro 500
      cy.intercept('PUT', '/api/admin/clientes/*', {
        statusCode: 500,
        body: { error: 'Erro interno do servidor' }
      }).as('serverError');
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.editarButton.click();
      });
      
      AdminClientesPage.edicaoSalvarButton.click();
      
      cy.wait('@serverError');
      AdminClientesPage.mensagemErro.should('be.visible');
    });

    it('não deve permitir ações simultâneas no mesmo cliente', () => {
      AdminClientesPage.visitar();
      
      // Tenta abrir múltiplos modais
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.editarButton.click();
      });
      
      AdminClientesPage.edicaoModal.should('be.visible');
      
      // Tenta abrir inativação enquanto edição está aberta
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.inativarButton.click();
      });
      
      // Não deve abrir segundo modal
      AdminClientesPage.inativacaoModal.should('not.exist');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter aria labels nos botões de ação', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.editarButton.should('have.attr', 'aria-label');
        AdminClientesPage.inativarButton.should('have.attr', 'aria-label');
        AdminClientesPage.resetarSenhaButton.should('have.attr', 'aria-label');
      });
    });

    it('deve ter foco gerenciável nos modais', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.editarButton.click();
      });
      
      AdminClientesPage.edicaoNomeInput.should('be.focused');
    });

    it('deve ter descrições para leitores de tela', () => {
      AdminClientesPage.visitar();
      
      AdminClientesPage.tabelaLinhas.first().within(() => {
        AdminClientesPage.editarButton.click();
      });
      
      AdminClientesPage.edicaoModal.should('have.attr', 'aria-describedby');
    });

    it('deve navegar por teclado', () => {
      AdminClientesPage.visitar();
      
      // Navega até primeira linha
      cy.tab();
      cy.tab();
      
      // Usa Enter para abrir menu de ações
      cy.get('body').type('{enter}');
      
      // Verifica se menu abriu
      cy.get('[data-cy="acoes-menu"]').should('be.visible');
    });
  });
});