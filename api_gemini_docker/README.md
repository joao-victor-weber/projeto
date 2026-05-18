# API Gemini com Flask, Vite e Docker

Aplicação simples com backend Flask, frontend Vite/React e integração com a API Gemini.

## Como rodar com Docker

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Abra o `.env` e coloque sua chave:

```env
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-2.5-flash
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
$env:VITE_API_URL="http://localhost:5000"
npm run dev
```

## Kubernetes

Os manifests ficam em `.k8s/` e usam o namespace `sistema`.

Antes de aplicar, edite `.k8s/secret.yaml` e substitua `GEMINI_API_KEY` por uma chave real.

```bash
kubectl apply -f .k8s/
```

O Ingress está configurado para `sistema.toritestskano.com`.
