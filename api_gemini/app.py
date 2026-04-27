import os
from google import genai
from google.genai import types, errors

API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("chave_Api")

if not API_KEY:
    raise ValueError(
        "Defina a variável de ambiente GEMINI_API_KEY ou chave_Api com sua chave da API."
    )

with genai.Client(api_key=API_KEY) as client:
    chat = client.chats.create(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
            system_instruction="Responda sempre em pt-BR nativo."
        ),
    )

    while True:
        pergunta = input('Para sair, digite "fechar". Pergunte o que quiser: ').strip()

        if pergunta.lower() == "fechar":
            print("Conversa encerrada.")
            break

        if not pergunta:
            print("Digite alguma pergunta.")
            continue

        try:
            resposta = chat.send_message(pergunta)
            print(resposta.text)
        except errors.APIError as e:
            print(f"Erro da API ({e.code}): {e.message}")
        except Exception as e:
            print(f"Erro inesperado: {e}")