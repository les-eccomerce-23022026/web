# Documentação de Integração - Módulo Cliente (Frontend -> Backend)

Esta documentação detalha as rotas de API e os esquemas de dados (JSON) utilizados pelo frontend para as operações de cadastro, atualização e gerenciamento de perfil do cliente.

## 1. Cadastro de Cliente (Registro Completo)

Utilizado na tela de cadastro para criar um novo cliente com dados pessoais, telefone, endereço de cobrança e endereço de entrega inicial.

- **Rota:** `POST /api/clientes/registro`
- **Content-Type:** `application/json`

### Payload (JSON)

```json
{
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "email": "joao@email.com",
  "senha": "SenhaForte123!",
  "confirmacao_senha": "SenhaForte123!",
  "genero": "Masculino",
  "dataNascimento": "1990-05-15",
  "telefone": {
    "tipo": "Celular",
    "ddd": "11",
    "numero": "98888-7777"
  },
  "enderecoCobranca": {
    "apelido": "Casa Pais",
    "tipoResidencia": "Casa",
    "tipoLogradouro": "Rua",
    "logradouro": "Rua das Flores",
    "numero": "123",
    "complemento": "Apto 10",
    "bairro": "Centro",
    "cep": "01234-567",
    "cidade": "São Paulo",
    "estado": "SP",
    "pais": "Brasil"
  },
  "enderecoEntrega": {
    "apelido": "Trabalho",
    "tipoResidencia": "Comercial",
    "tipoLogradouro": "Avenida",
    "logradouro": "Av. Paulista",
    "numero": "1000",
    "complemento": "Andar 15",
    "bairro": "Bela Vista",
    "cep": "01310-123",
    "cidade": "São Paulo",
    "estado": "SP",
    "pais": "Brasil"
  },
  "enderecoEntregaIgualCobranca": false
}
```

### Tipos e Restrições

- **genero**: `"Masculino" | "Feminino" | "Outro" | "Prefiro não informar"`
- **telefone.tipo**: `"Celular" | "Residencial" | "Comercial"`
- **dataNascimento**: String no formato `YYYY-MM-DD`.

---

## 2. Atualização de Dados Cadastrais (Perfil)

Utilizado na tela de "Meu Perfil" para alterar dados básicos e contato.

- **Rota:** `PUT /api/clientes/perfil`
- **Content-Type:** `application/json`

### Payload (JSON)

```json
{
  "nome": "João Silva Alterado",
  "genero": "Masculino",
  "dataNascimento": "1990-05-15",
  "telefone": {
    "tipo": "Celular",
    "ddd": "11",
    "numero": "97777-6666"
  }
}
```

---

## 3. Alteração de Senha

Utilizado para alteração específica da credencial de acesso.

- **Rota:** `PATCH /api/clientes/seguranca/alterar-senha`
- **Content-Type:** `application/json`

### Payload (JSON)

```json
{
  "senha_atual": "SenhaAntiga123!",
  "nova_senha": "NovaSenha456!",
  "confirmacao_senha": "NovaSenha456!"
}
```

---

## 4. Gerenciamento de Endereços

### Listar Endereços

- **Rota:** `GET /api/clientes/perfil/enderecos`
- **Retorno:** Array de objetos de endereço com `uuid`.

### Adicionar Endereço

- **Rota:** `POST /api/clientes/perfil/enderecos`
- **Payload:** Objeto de endereço (sem `uuid`).

### Editar Endereço

- **Rota:** `PUT /api/clientes/perfil/enderecos/{uuid}`
- **Payload:** Objeto de endereço parcial ou completo.

### Remover Endereço

- **Rota:** `DELETE /api/clientes/perfil/enderecos/{uuid}`

---

## 5. Gerenciamento de Cartões

### Listar Cartões

- **Rota:** `GET /api/clientes/perfil/cartoes`

### Adicionar Cartão

- **Rota:** `POST /api/clientes/perfil/cartoes`
- **Payload:** (Enviado após tratamento pelo frontend)

```json
{
  "idBandeiraCartao": 1,
  "tokenCartao": "tok_sim_123456789",
  "finalCartao": "1234",
  "nomeImpresso": "JOAO SILVA",
  "validade": "2029-12-01T00:00:00.000Z",
  "principal": false
}
```

_Nota: O backend deve processar o número completo e retornar apenas o `finalCartao` para o frontend._

### Remover Cartão

- **Rota:** `DELETE /api/clientes/perfil/cartoes/{uuid}`

### Definir Cartão Preferencial

- **Rota:** `PATCH /api/clientes/perfil/cartoes/{uuid}/principal`

---

## 6. Inativação de Conta

- **Rota:** `DELETE /api/clientes/perfil`
- **Ação:** Altera o status do cliente para inativo no sistema.
