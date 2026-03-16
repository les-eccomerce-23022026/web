import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação', () => {
  
  test('deve realizar login com sucesso como administrador', async ({ page }) => {
    // Habilitar captura de logs do console do navegador no terminal
    page.on('console', msg => {
      if (msg.type() === 'error') console.log(`[Browser Error]: ${msg.text()}`);
    });

    await page.goto('/minha-conta');

    await page.fill('[data-cy="login-email-input"]', 'admin@livraria.com.br');
    await page.fill('[data-cy="login-password-input"]', 'Admin@123');

    await page.click('[data-cy="login-submit-button"]');

    // Se o login falhar, tentamos capturar a mensagem de erro que aparece na tela
    const errorMessage = page.locator('p[class*="auth-message-error"]');
    
    try {
      // Esperar pelo redirecionamento com um timeout menor para não travar
      await expect(page).toHaveURL(/.*admin/, { timeout: 8000 });
    } catch (e) {
      // Se falhou o redirecionamento, verifica se tem erro visível no HTML
      const textoErro = await errorMessage.innerText().catch(() => 'Nenhuma mensagem de erro visível na tela');
      console.log(`\n❌ Falha no login detectada: "${textoErro}"`);
      throw e;
    }
  });

  test('deve exibir erro ao tentar login com credenciais inválidas', async ({ page }) => {
    await page.goto('/minha-conta');

    await page.fill('[data-cy="login-email-input"]', 'usuario_inexistente@teste.com');
    await page.fill('[data-cy="login-password-input"]', 'SenhaErrada123');

    await page.click('[data-cy="login-submit-button"]');

    // Verificar se a mensagem de erro aparece
    // O seletor styles['auth-message-error'] no seu código gera uma classe dinâmica, 
    // mas o Playwright pode buscar pelo texto ou pela estrutura
    const errorMessage = page.locator('p[class*="auth-message-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).not.toBeEmpty();
  });

});
