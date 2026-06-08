# Guia do Projeto Api IA Web

Este guia explica o projeto `api_ia_web`: uma aplicacao web com cadastro, login,
menu de IAs e chat protegido por autenticacao. O sistema e dividido em frontend,
backend e banco de dados, com suporte a execucao local e via Docker.

## 1. Visao geral

O objetivo do projeto e oferecer uma plataforma simples para o usuario acessar
IAs por meio de uma interface web.

Fluxo principal:

1. O usuario cria uma conta na tela de cadastro.
2. O usuario faz login com email e senha.
3. O backend valida as credenciais e retorna um token JWT.
4. O frontend salva o token e os dados do usuario no `localStorage`.
5. O usuario acessa o dashboard com a lista de IAs.
6. O usuario escolhe uma IA e envia mensagens pelo chat.
7. O backend valida o token e encaminha a mensagem para a IA suportada.

Atualmente, o catalogo mostra tres IAs:

- `gemini`
- `openai`
- `claude`

Porem, o chat implementado de fato funciona apenas com `gemini`. As opcoes
`openai` e `claude` aparecem no menu, mas ainda retornam erro ao tentar conversar.

## 2. Arquitetura

O projeto fica organizado em tres partes principais:

```text
api_ia_web/
  backend/       API Node.js com Express
  frontend/      Interface React com Vite
  docker-compose.yaml
```

Arquitetura em alto nivel:

```text
Usuario
  |
  v
Frontend React/Vite
  |
  v
Backend Express
  |
  +--> PostgreSQL
  |
  +--> Google Gemini via LangChain
```

Tecnologias principais:

- Frontend: React, Vite, React Router e Axios.
- Backend: Node.js, Express, JWT, bcryptjs, pg e LangChain.
- Banco de dados: PostgreSQL.
- IA: `@langchain/google` usando o modelo `gemini-2.5-flash`.
- Testes: Vitest, Testing Library e Supertest.
- Containers: Docker e Docker Compose.

## 3. Backend

O backend esta em `backend/` e sobe uma API HTTP na porta `3000` por padrao.

Arquivos importantes:

- `src/server.js`: inicia o servidor Express.
- `src/app.js`: configura CORS, JSON e registra as rotas.
- `src/routes/`: define as rotas HTTP.
- `src/controllers/`: recebe requisicoes e devolve respostas.
- `src/services/`: contem regras de negocio, autenticacao e integracao com IA.
- `src/repositories/`: concentra acesso ao banco.
- `src/database/`: conexao PostgreSQL e migrations.
- `src/middlewares/authMiddleware.js`: protege rotas com JWT.

### 3.1 Rotas de saude

As rotas de saude ajudam a verificar se o backend e o banco estao funcionando.

```text
GET /health
```

Retorna se o backend esta rodando.

```text
GET /health/db
```

Testa a conexao com o PostgreSQL usando `SELECT NOW()`.

### 3.2 Rotas de autenticacao

As rotas de autenticacao ficam sob `/auth`.

```text
POST /auth/register
```

Cria um usuario. Campos esperados:

```json
{
  "name": "Joao",
  "email": "joao@example.com",
  "password": "123456"
}
```

Regras principais:

- `name` e obrigatorio.
- `email` e obrigatorio.
- `password` e obrigatorio.
- `password` precisa ter pelo menos 6 caracteres.
- `email` deve ser unico.
- `name` deve ser unico.
- A senha e salva como hash usando `bcryptjs`.

```text
POST /auth/login
```

Autentica o usuario. Campos esperados:

```json
{
  "email": "joao@example.com",
  "password": "123456"
}
```

Quando o login da certo, o backend retorna:

- dados publicos do usuario;
- token JWT.

O token inclui `userId`, `email` e `name`, e usa `JWT_SECRET` para assinatura.

### 3.3 Rotas de IA

As rotas de IA ficam sob `/api/ais`.

```text
GET /api/ais
```

Retorna a lista de IAs exibida no dashboard.

```text
POST /api/ais/:aiId/chat
```

Envia uma mensagem para a IA selecionada. Essa rota e protegida, entao precisa
receber o token JWT no cabecalho:

```text
Authorization: Bearer <TOKEN>
```

Corpo esperado:

```json
{
  "message": "Explique o que e React"
}
```

Atualmente, apenas `aiId = gemini` e suportado. Para qualquer outro `aiId`, a API
retorna erro informando que a IA ainda nao e suportada.

## 4. Banco de dados

O projeto usa PostgreSQL. A conexao e criada em `backend/src/database/connection.js`
com a variavel `DATABASE_URL`.

A migration atual cria a tabela `users`:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Para rodar migrations:

```bash
cd backend
npm run migrate
```

## 5. Frontend

O frontend esta em `frontend/` e usa React com Vite.

Arquivos importantes:

- `src/main.jsx`: inicializa a aplicacao React.
- `src/App.jsx`: define as rotas da aplicacao.
- `src/pages/Login.jsx`: tela de login.
- `src/pages/Register.jsx`: tela de cadastro.
- `src/pages/Dashboard.jsx`: menu de IAs.
- `src/pages/Chat.jsx`: tela de conversa.
- `src/services/api.js`: cliente Axios para chamar o backend.

### 5.1 Rotas da interface

```text
/             Login
/register     Cadastro
/dashboard    Menu de IAs, protegido por token
/chat/:aiId   Chat com uma IA, protegido por token
```

A protecao no frontend acontece no componente `PrivateRoute`. Se nao existir
`api_ia_web_token` no `localStorage`, o usuario e redirecionado para `/`.

### 5.2 Cliente HTTP

O arquivo `src/services/api.js` cria uma instancia Axios com a base URL:

```text
VITE_API_BASE_URL
```

Se essa variavel nao existir, o frontend usa:

```text
http://localhost:3000
```

O interceptor do Axios busca o token em:

```text
api_ia_web_token
```

Se existir token, ele adiciona automaticamente:

```text
Authorization: Bearer <TOKEN>
```

### 5.3 Dados salvos no navegador

O frontend usa `localStorage` para salvar:

- `api_ia_web_token`: token JWT retornado no login.
- `api_ia_web_user`: dados publicos do usuario logado.
- `api_ia_web_conversation_user_<userId>_<aiId>`: conversa salva por usuario e IA.

Isso significa que o historico do chat fica no navegador do usuario, nao no banco
de dados.

## 6. Variaveis de ambiente

O backend possui um arquivo de exemplo:

```text
backend/.env.example
```

Exemplo de configuracao:

```env
PORT=3000
GOOGLE_API_KEY=
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/api_ia_web
JWT_SECRET=
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
```

Descricao das variaveis:

- `PORT`: porta do backend. Padrao: `3000`.
- `GOOGLE_API_KEY`: chave da API do Google usada pelo Gemini.
- `DATABASE_URL`: URL de conexao com o PostgreSQL.
- `JWT_SECRET`: segredo usado para assinar e validar tokens JWT.
- `JWT_EXPIRES_IN`: tempo de expiracao do token. Padrao usado no codigo: `1d`.
- `CORS_ORIGIN`: origens permitidas para acessar a API. Padrao: `http://localhost:5173`.

Para desenvolvimento local, crie `backend/.env` com base em
`backend/.env.example` e preencha os valores necessarios.

Importante: nao coloque valores reais de `GOOGLE_API_KEY` ou `JWT_SECRET` em
arquivos versionados.

## 7. Como rodar localmente

### 7.1 Backend

Entre na pasta do backend:

```bash
cd api_ia_web/backend
```

Instale as dependencias:

```bash
npm install
```

Crie o arquivo `.env` com base no `.env.example`.

Rode as migrations:

```bash
npm run migrate
```

Suba o backend em modo desenvolvimento:

```bash
npm run dev
```

O backend ficara disponivel em:

```text
http://localhost:3000
```

### 7.2 Frontend

Em outro terminal, entre na pasta do frontend:

```bash
cd api_ia_web/frontend
```

Instale as dependencias:

```bash
npm install
```

Suba o Vite:

```bash
npm run dev
```

O frontend normalmente fica disponivel em:

```text
http://localhost:5173
```

## 8. Como rodar com Docker

Na raiz do projeto:

```bash
cd api_ia_web
```

Suba os containers:

```bash
docker compose up --build
```

Servicos definidos no `docker-compose.yaml`:

- `postgres`: banco PostgreSQL na porta `5432`.
- `backend`: API na porta `3000`.
- `frontend`: aplicacao servida por Nginx na porta `8080`.

URLs principais:

```text
Frontend: http://localhost:8080
Backend:  http://localhost:3000
Postgres: localhost:5432
```

Observacao: quando o backend roda dentro do Docker Compose, o host do banco deve
ser o nome do servico `postgres`, nao `localhost`. Um exemplo comum para
`DATABASE_URL` nesse caso e:

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/api_ia_web
```

## 9. Testes

### 9.1 Testes do backend

Na pasta `backend/`:

```bash
npm test
```

Roda os testes unitarios e de rotas que nao sao de integracao.

Para rodar testes de integracao:

```bash
npm run test:integration
```

Os testes de integracao dependem do PostgreSQL configurado e acessivel.

Para rodar todos os testes:

```bash
npm run test:all
```

### 9.2 Testes do frontend

Na pasta `frontend/`:

```bash
npm test
```

Os testes cobrem:

- renderizacao das telas de login e cadastro;
- dashboard com lista de IAs;
- cliente Axios e envio automatico do token;
- chat, envio de mensagem e conversa salva no `localStorage`.

## 10. Exemplos de requisicoes com cURL

Os exemplos abaixo assumem que o backend esta rodando em `http://localhost:3000`.
No PowerShell, se `curl` for tratado como alias, use `curl.exe`.

### 10.1 Verificar saude do backend

```bash
curl http://localhost:3000/health
```

### 10.2 Criar usuario

```bash
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"name":"Joao","email":"joao@example.com","password":"123456"}'
```

### 10.3 Fazer login

```bash
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"joao@example.com","password":"123456"}'
```

Guarde o token retornado em `data.token`. Ele sera usado nas rotas protegidas.

### 10.4 Listar IAs

```bash
curl http://localhost:3000/api/ais
```

### 10.5 Enviar mensagem para o Gemini

Substitua `<TOKEN>` pelo token retornado no login:

```bash
curl -X POST http://localhost:3000/api/ais/gemini/chat -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" -d '{"message":"Explique o que e uma API em poucas palavras"}'
```

## 11. Pontos importantes do projeto

- O backend separa responsabilidades entre rotas, controllers, services e repositories.
- A senha nunca e retornada nas respostas da API.
- O JWT e usado para proteger o endpoint de chat.
- A conversa do chat fica salva no navegador, nao no PostgreSQL.
- A lista de IAs tem tres opcoes, mas apenas Gemini esta integrado no backend.
- O frontend depende da API configurada por `VITE_API_BASE_URL`.
- O Docker Compose facilita subir banco, backend e frontend juntos.

## 12. Ideias de evolucao

Possiveis melhorias futuras:

- Implementar suporte real para OpenAI e Claude.
- Salvar historico de conversas no PostgreSQL.
- Criar uma tabela de conversas e mensagens.
- Melhorar validacao de email e senha.
- Adicionar refresh token ou logout no backend.
- Criar um README principal mais completo usando este guia como base.
- Ajustar o Nginx do frontend para apontar para o nome correto do servico backend,
  caso a aplicacao seja servida apenas por proxy interno.
