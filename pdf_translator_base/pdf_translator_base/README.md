# PDF Translator Base

Base de projeto em Python para:

- ler PDFs com texto extraível
- traduzir o conteúdo com Gemini
- gerar um novo PDF com o texto traduzido
- expor uma interface simples via Flask
- rodar localmente ou em Docker

## Visão geral da arquitetura

```text
Upload PDF -> pypdf extrai texto -> chunker divide o conteúdo -> Gemini traduz -> ReportLab gera novo PDF
```

## Estrutura

```text
pdf_translator_base/
├─ app/
│  ├─ services/
│  │  ├─ gemini_translator.py
│  │  ├─ pdf_extractor.py
│  │  ├─ pdf_pipeline.py
│  │  └─ pdf_writer.py
│  ├─ utils/
│  │  └─ text_chunker.py
│  ├─ static/
│  ├─ templates/
│  ├─ __init__.py
│  ├─ config.py
│  └─ routes.py
├─ storage/
│  ├─ input/
│  ├─ output/
│  └─ tmp/
├─ tests/
├─ .env.example
├─ Dockerfile
├─ docker-compose.yml
├─ requirements.txt
├─ run.py
└─ wsgi.py
```

## Requisitos

- Python 3.12+
- chave de API do Gemini em `GEMINI_API_KEY`
- Docker e Docker Compose, se quiser subir em container

## Como rodar localmente

```bash
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env
python run.py
```

A aplicação sobe em `http://localhost:5000`.

## Como rodar com Docker

```bash
cp .env.example .env
docker compose up --build
```

## Endpoint da API

### `GET /api/v1/health`

Retorna status do serviço.

### `POST /api/v1/translate`

`multipart/form-data`:

- `file`: PDF
- `source_language`: idioma de origem, por exemplo `Portuguese` ou `auto`
- `target_language`: idioma de destino, por exemplo `English`
- `model`: opcional, por exemplo `gemini-2.5-flash`

Exemplo com `curl`:

```bash
curl -X POST http://localhost:5000/api/v1/translate \
  -F "file=@./meu-arquivo.pdf" \
  -F "source_language=Portuguese" \
  -F "target_language=English" \
  -o traducao.pdf
```

## Limitações desta base

Esta base prioriza um fluxo funcional e simples. Então ela **não preserva o layout original do PDF**. O pipeline atual:

1. extrai o texto
2. traduz o conteúdo por blocos
3. recria um novo PDF paginado com o texto traduzido

## Próximos passos recomendados

1. Adicionar OCR para PDFs escaneados com `ocrmypdf` ou `tesseract`.
2. Preservar layout aproximado por página, blocos e imagens.
3. Salvar jobs e histórico em banco.
4. Adicionar fila assíncrona com Celery ou RQ.
5. Adicionar autenticação e rate limit.
6. Criar testes para pipeline e mocks do Gemini.
7. Adicionar suporte a DOCX e TXT.

## Observações de engenharia

- Use `gemini-2.5-flash` como padrão para começar.
- Para documentos grandes, ajuste `CHUNK_SIZE`.
- Para produção, troque a `SECRET_KEY`, configure logs e use armazenamento persistente.

## Licença

Use como base e adapte ao seu projeto.
