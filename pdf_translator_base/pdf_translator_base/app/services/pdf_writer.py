from __future__ import annotations

from pathlib import Path
from typing import Iterable

from reportlab.lib.pagesizes import A4, LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer

from .gemini_translator import TranslationChunk


class PDFWriter:
    PAGE_SIZES = {
        "A4": A4,
        "LETTER": LETTER,
    }

    def __init__(self, page_size: str = "A4") -> None:
        self.page_size = self.PAGE_SIZES.get(page_size.upper(), A4)

    def write(self, output_path: Path, translated_pages: Iterable[TranslationChunk], title: str) -> Path:
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "TitleStyle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            spaceAfter=12,
        )
        page_label_style = ParagraphStyle(
            "PageLabelStyle",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=14,
            spaceBefore=6,
            spaceAfter=8,
        )
        body_style = ParagraphStyle(
            "BodyStyle",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=11,
            leading=15,
            spaceAfter=8,
        )

        story = [Paragraph(title, title_style), Spacer(1, 0.2 * cm)]

        pages = list(translated_pages)
        for index, item in enumerate(pages):
            story.append(Paragraph(f"Página {item.page_number}", page_label_style))
            for paragraph in self._split_paragraphs(item.text):
                story.append(Paragraph(self._escape(paragraph), body_style))
            if index < len(pages) - 1:
                story.append(PageBreak())

        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=self.page_size,
            leftMargin=2 * cm,
            rightMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
            title=title,
        )
        doc.build(story)
        return output_path

    @staticmethod
    def _split_paragraphs(text: str) -> list[str]:
        paragraphs = [part.strip() for part in text.split("\n\n")]
        return [p.replace("\n", "<br/>") for p in paragraphs if p]

    @staticmethod
    def _escape(text: str) -> str:
        return (
            text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
        )
