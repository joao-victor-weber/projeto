import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai
from google.genai import errors, types

app = Flask(__name__)

CORS(
    app,
    resources={r"/api/*": {"origins": os.getenv("CORS_ORIGINS", "*")}},
)

MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def get_api_key() -> str:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("google_key")
    if not api_key:
        raise RuntimeError(
            "Defina a variável GEMINI_API_KEY no arquivo .env ou nas variáveis do sistema."
        )
    return api_key


def perguntar_ao_gemini(pergunta: str) -> str:
    client = genai.Client(api_key=get_api_key())

    try:
        chat = client.chats.create(
            model=MODEL_NAME,
            config=types.GenerateContentConfig(
                system_instruction="Responda sempre em pt-BR nativo.",
                max_output_tokens=2048,
            ),
        )
        resposta = chat.send_message(pergunta)
        return resposta.text or "O Gemini não retornou texto."
    finally:
        close = getattr(client, "close", None)
        if callable(close):
            close()


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "model": MODEL_NAME})


@app.post("/api/pergunta")
def perguntar():
    dados = request.get_json(silent=True) or {}
    pergunta = str(dados.get("pergunta", "")).strip()

    if not pergunta:
        return jsonify({"erro": "Digite uma pergunta antes de enviar."}), 400

    if pergunta.lower() in {"sair", "fechar"}:
        return jsonify({"resposta": "Conversa encerrada."})

    try:
        resposta = perguntar_ao_gemini(pergunta)
        return jsonify({"resposta": resposta})
    except RuntimeError as e:
        return jsonify({"erro": str(e)}), 500
    except errors.APIError as e:
        return jsonify({"erro": f"Erro da API Gemini ({e.code}): {e.message}"}), 502
    except Exception as e:
        return jsonify({"erro": f"Erro inesperado: {e}"}), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "0") == "1",
    )
