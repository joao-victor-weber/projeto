# API Gemini com Flask, Vite e Docker

## Como rodar com Docker

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Abra o `.env` e coloque sua chave:

```env
GEMINI_API_KEY=sua_chave_aqui
```

3. Suba o projeto:

```bash
docker compose up --build
```

4. Acesse:

- Frontend: http://localhost:5173
- Backend health check: http://localhost:5000/api/health

## Como rodar sem Docker

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export GEMINI_API_KEY=sua_chave_aqui
python app.py
```

No Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:GEMINI_API_KEY="sua_chave_aqui"
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Principais correções feitas

- Corrigido `requirements.txt`: em Python, dependências usam `==` ou `>=`, não `=`.
- Corrigido `docker-compose.yaml`: o build agora aponta para `./backend` e `./frontend`.
- Corrigido Dockerfile do backend: agora roda com Gunicorn e escuta em `0.0.0.0:5000`.
- Corrigido Flask: removida dependência de template antigo e mantida apenas a API JSON.
- Corrigido frontend: Vite roda em `0.0.0.0`, necessário dentro do Docker.
- Removida `.venv` do projeto final: ambientes virtuais não devem ser enviados dentro do ZIP.
