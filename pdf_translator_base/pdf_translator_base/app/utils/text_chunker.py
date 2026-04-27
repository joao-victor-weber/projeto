from __future__ import annotations


def chunk_page_text(text: str, max_chars: int = 3500) -> list[str]:
    cleaned = text.strip()
    if not cleaned:
        return []

    paragraphs = [p.strip() for p in cleaned.split("\n\n") if p.strip()]
    if not paragraphs:
        return [cleaned]

    chunks: list[str] = []
    current = ""

    for paragraph in paragraphs:
        candidate = f"{current}\n\n{paragraph}".strip() if current else paragraph
        if len(candidate) <= max_chars:
            current = candidate
            continue

        if current:
            chunks.append(current)
            current = ""

        if len(paragraph) <= max_chars:
            current = paragraph
            continue

        slices = _split_long_paragraph(paragraph, max_chars)
        chunks.extend(slices[:-1])
        current = slices[-1]

    if current:
        chunks.append(current)

    return chunks


def _split_long_paragraph(text: str, max_chars: int) -> list[str]:
    words = text.split()
    if not words:
        return [text]

    chunks: list[str] = []
    current = ""

    for word in words:
        candidate = f"{current} {word}".strip() if current else word
        if len(candidate) <= max_chars:
            current = candidate
        else:
            if current:
                chunks.append(current)
            current = word

    if current:
        chunks.append(current)

    return chunks
