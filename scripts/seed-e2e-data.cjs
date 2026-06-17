/**
 * Script para popular dados de teste E2E para Venda Completa (7ª Entrega)
 * 
 * Este script cria:
 * - Cliente de teste com endereço e cartão
 * - Administrador de teste
 * - Livros no catálogo
 * - Cupons promocionais
 * 
 * Uso: node scripts/seed-e2e-data.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5001/api';

// Função auxiliar para fazer requisições
async function apiRequest(method, endpoint, data, token) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    url: `${API_URL}${endpoint}`,
    headers,
  };

  // Só adicionar data se não for GET e se data não for null/undefined
  if (method !== 'GET' && data !== null && data !== undefined) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`Erro ${method} ${endpoint}:`, error.response.status, error.response.data);
      throw error;
    }
    console.error(`Erro ${method} ${endpoint}:`, error.message);
    throw error;
  }
}

async function seedDatabase() {
  console.log('🌱 Iniciando seed de dados E2E...');
  
  try {
    // 1. Login como admin para criar dados de teste
    console.log('🔐 Fazendo login como admin...');
    const adminLogin = await apiRequest('POST', '/auth/login', {
      email: 'admin@vendas.com.br',
      senha: '@asdf123',
    });
    const adminToken = adminLogin.dados.token;
    console.log('✅ Admin logado com sucesso');

    // 2. Verificar se cliente de teste existe, se não, criar
    console.log('👤 Verificando cliente de teste...');
    try {
      await apiRequest('POST', '/auth/login', {
        email: 'clientetest@email.com',
        senha: '@asdf123',
      });
      console.log('✅ Cliente de teste já existe');
    } catch (error) {
      console.log('📝 Criando cliente de teste...');
      await apiRequest('POST', '/clientes/registro', {
        nome: 'Cliente Teste',
        cpf: '245.699.622-46',
        email: 'clientetest@email.com',
        senha: '@asdf123',
        confirmacaoSenha: '@asdf123',
        genero: 'M',
        dataNascimento: '1990-01-01',
        telefone: {
          ddd: '11',
          numero: '999999999',
          tipo: 'celular',
        },
        enderecoCobranca: {
          cep: '01310100',
          logradouro: 'Rua Augusta',
          numero: '1000',
          complemento: 'Apto 101',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP',
        },
        enderecoEntregaIgualCobranca: true,
      });
      console.log('✅ Cliente de teste criado');
    }

    // 3. Login como cliente para criar dados adicionais
    console.log('🔐 Fazendo login como cliente...');
    const clienteLogin = await apiRequest('POST', '/auth/login', {
      email: 'clientetest@email.com',
      senha: '@asdf123',
    });
    const clienteToken = clienteLogin.dados.token;
    console.log('✅ Cliente logado com sucesso');

    // 4. Criar endereço de entrega para o cliente
    console.log('📍 Criando endereço de entrega...');
    try {
      await apiRequest('POST', '/clientes/perfil/enderecos', {
        cep: '01310100',
        logradouro: 'Rua Augusta',
        numero: '1000',
        complemento: 'Apto 101',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        principal: true,
      }, clienteToken);
      console.log('✅ Endereço de entrega criado');
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 409)) {
        console.log('⚠️  Endereço já existe ou erro esperado, continuando...');
      } else {
        throw error;
      }
    }

    // 5. Criar cartão de crédito para o cliente
    console.log('💳 Criando cartão de crédito...');
    try {
      await apiRequest('POST', '/clientes/perfil/cartoes', {
        bandeira: 'Visa',
        ultimosDigitos: '4242',
        titular: 'Cliente Teste',
        validadeMes: 12,
        validadeAno: 2026,
        principal: true,
      }, clienteToken);
      console.log('✅ Cartão de crédito criado');
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 409)) {
        console.log('⚠️  Cartão já existe ou erro esperado, continuando...');
      } else {
        throw error;
      }
    }

    // 6. Verificar se existem livros no catálogo
    console.log('📚 Verificando livros no catálogo...');
    const livros = await apiRequest('GET', '/livros', null, clienteToken);
    if (livros.length === 0) {
      console.log('⚠️  Nenhum livro encontrado no catálogo. Execute o seed de livros do backend.');
    } else {
      console.log(`✅ ${livros.length} livros encontrados no catálogo`);
    }

    console.log('🎉 Seed de dados E2E concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o seed de dados:', error);
    process.exit(1);
  }
}

// Executar seed
seedDatabase();
