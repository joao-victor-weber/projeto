from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List

from google import genai
from google.genai import types


@dataclass(slots=True)
class TranslationChunk:
    page_number: int
    text: str


class GeminiTranslator:
    def __init__(self, api_key: str, default_model: str) -> None:
        if not api_key:
            raise ValueError("Defina a variável de ambiente GEMINI_API_KEY.")
        self.client = genai.Client(api_key=api_key)
        self.default_model = default_model

    def translate_chunks(
        self,
        chunks: Iterable[TranslationChunk],
        target_language: str,
        source_language: str = "auto",
        model: str | None = None,
    ) -> List[TranslationChunk]:
        translated: List[TranslationChunk] = []
        selected_model = model or self.default_model

        for chunk in chunks:
            prompt = self._build_prompt(
                text=chunk.text,
                target_language=target_language,
                source_language=source_language,
            )
            response = self.client.models.generate_content(
                model=selected_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    thinking_config=types.ThinkingConfig(thinking_budget=0),
                ),
            )
            translated_text = (response.text or "").strip()
            translated.append(TranslationChunk(page_number=chunk.page_number, text=translated_text))

        return translated

    @staticmethod
    def _build_prompt(text: str, target_language: str, source_language: str) -> str:
        return f"""
Você é um tradutor profissional de documentos.

Regras obrigatórias:
1. Traduza o conteúdo para {target_language}.
2. Idioma de origem: {source_language}.
3. Preserve títulos, listas, numeração e quebras de parágrafo quando possível.
4. Não resuma.
5. Não explique.
6. Não adicione notas.
7. Retorne apenas o texto traduzido.

Texto:
{text}
""".strip()
