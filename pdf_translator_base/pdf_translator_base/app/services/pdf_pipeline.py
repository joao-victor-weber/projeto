from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .gemini_translator import GeminiTranslator, TranslationChunk
from .pdf_extractor import PDFExtractor
from .pdf_writer import PDFWriter
from ..utils.text_chunker import chunk_page_text


@dataclass(slots=True)
class PipelineResult:
    input_pdf: Path
    output_pdf: Path


class PDFTranslationPipeline:
    def __init__(self, config) -> None:
        self.config = config
        self.extractor = PDFExtractor()
        self.translator = GeminiTranslator(
            api_key=config["GEMINI_API_KEY"],
            default_model=config["GEMINI_MODEL"],
        )
        self.writer = PDFWriter(page_size=config["PDF_PAGE_SIZE"])

    def run(
        self,
        pdf_path: Path,
        target_language: str,
        source_language: str = "auto",
        model: str | None = None,
    ) -> PipelineResult:
        pages = self.extractor.extract_pages(pdf_path)

        translated_pages: list[TranslationChunk] = []
        for page in pages:
            chunks = [
                TranslationChunk(page_number=page.page_number, text=chunk)
                for chunk in chunk_page_text(page.text, self.config["CHUNK_SIZE"])
            ]
            translated_chunks = self.translator.translate_chunks(
                chunks=chunks,
                target_language=target_language,
                source_language=source_language,
                model=model,
            )
            merged_text = "\n\n".join(chunk.text for chunk in translated_chunks if chunk.text)
            translated_pages.append(TranslationChunk(page_number=page.page_number, text=merged_text))

        output_name = f"{pdf_path.stem}.{target_language.lower().replace(' ', '_')}.translated.pdf"
        output_path = Path(self.config["OUTPUT_DIR"]) / output_name

        self.writer.write(
            output_path=output_path,
            translated_pages=translated_pages,
            title=f"Tradução de {pdf_path.name} para {target_language}",
        )

        return PipelineResult(input_pdf=pdf_path, output_pdf=output_path)
