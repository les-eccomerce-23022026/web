# Scripts de Setup do Frontend

Documentação dos scripts de setup automatizado do frontend React + Next.js.

## 📁 Estrutura de Arquivos

```
web/
├── scripts/
│   ├── README-SETUP.md          # Este arquivo
│   ├── check-prerequisitos.sh   # Verificação de pré-requisitos
│   ├── setup-env.sh             # Configuração do .env
│   └── setup-complete.sh        # Setup completo (principal)
├── .env.example                 # Template de configuração
├── .env                         # Configuração gerada (não commitar)
└── ...
```

## 🚀 Como Usar

### Primeira Configuração (Clone do Repositório)

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd lab-eng-segunda-noite/web

# 2. Execute o setup completo
./scripts/setup-complete.sh
```

### Setup Completo

**Uso:** `./scripts/setup-complete.sh`

Script principal que orquestra todo o processo de setup do frontend.

**O que faz:**
- Verifica pré-requisitos (Node.js, npm)
- Configura arquivo `.env` automaticamente
- Instala dependências npm
- Valida configuração
- Exibe resumo final com instruções

### Scripts Individuais

#### `check-prerequisitos.sh`
**Uso:** `./scripts/check-prerequisitos.sh`

Verifica se todos os pré-requisitos estão instalados:
- Node.js (versão mínima 18.x)
- npm
- Existência de node_modules (opcional)
- Existência de .env (opcional)

#### `setup-env.sh`
**Uso:** `./scripts/setup-env.sh`

Configura o arquivo `.env` a partir do `.env.example`:
- Copia `.env.example` para `.env`
- Configura valores padrão (BACKEND_URL, NODE_ENV)
- Não sobrescreve se `.env` já existe

## 🌐 URLs e Credenciais Após Setup

Após executar `setup-complete.sh`, o frontend estará configurado com:

**Frontend URL:**
- `http://localhost:3000` (desenvolvimento)

**Backend URL (configurado no .env):**
- `BACKEND_URL=http://localhost:3002` (desenvolvimento)

**Variáveis de Ambiente:**
- `BACKEND_URL`: URL da API do backend
- `NODE_ENV`: Ambiente (development/production)

## 📋 Pré-requisitos

- **Node.js**: 18.x ou superior
- **npm**: Instalado automaticamente com Node.js
- **Backend**: O backend deve estar rodando em `http://localhost:3002`

## 🔧 Comandos Úteis

```bash
# Iniciar frontend em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm run start

# Executar lint
npm run lint

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

## ⚠️ Notas Importantes

1. **Backend Dependência**: O frontend depende do backend estar rodando. Certifique-se de iniciar o backend antes do frontend.

2. **Portas**: O frontend usa porta 3000 por padrão. Se a porta estiver ocupada, o Next.js tentará usar outra porta.

3. **.env**: O arquivo `.env` não deve ser commitado no Git. Apenas `.env.example` deve ser versionado.

4. **Cypress**: Para testes E2E, use os scripts específicos do Cypress documentados no README principal.

## 🐛 Troubleshooting

### Erro: "Node.js não encontrado"
**Solução:** Instale Node.js 18 ou superior em https://nodejs.org/

### Erro: "Porta 3000 já em uso"
**Solução:** 
```bash
# Matar processo na porta 3000
fuser -k 3000/tcp
# Ou usar outra porta
npm run dev -- -p 3001
```

### Erro: "Dependências não instaladas"
**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Backend não respondendo"
**Solução:** Verifique se o backend está rodando em `http://localhost:3002`
```bash
cd ../backend
docker compose up -d
```
