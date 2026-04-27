from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List

from pypdf import PdfReader


@dataclass(slots=True)
class ExtractedPage:
    page_number: int
    text: str


class PDFExtractor:
    def extract_pages(self, pdf_path: Path) -> List[ExtractedPage]:
        reader = PdfReader(str(pdf_path))
        pages: List[ExtractedPage] = []

        for index, page in enumerate(reader.pages, start=1):
            text = (page.extract_text() or "").strip()
            if text:
                pages.append(ExtractedPage(page_number=index, text=text))

        if not pages:
            raise ValueError(
                "Nenhum texto extraível foi encontrado no PDF. "
                "Se o arquivo for escaneado, adicione uma etapa de OCR antes da tradução."
            )

        return pages
