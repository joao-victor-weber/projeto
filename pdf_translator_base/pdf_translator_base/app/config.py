from __future__ import annotations

import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
INPUT_DIR = STORAGE_DIR / "input"
OUTPUT_DIR = STORAGE_DIR / "output"
TMP_DIR = STORAGE_DIR / "tmp"


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 25 * 1024 * 1024))

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "3500"))
    REQUEST_TIMEOUT_SECONDS = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "180"))

    BASE_DIR = BASE_DIR
    STORAGE_DIR = STORAGE_DIR
    INPUT_DIR = INPUT_DIR
    OUTPUT_DIR = OUTPUT_DIR
    TMP_DIR = TMP_DIR

    PDF_PAGE_SIZE = os.getenv("PDF_PAGE_SIZE", "A4")
    FONT_NAME = os.getenv("FONT_NAME", "Helvetica")
    TITLE_FONT_SIZE = int(os.getenv("TITLE_FONT_SIZE", "16"))
    BODY_FONT_SIZE = int(os.getenv("BODY_FONT_SIZE", "11"))

    @classmethod
    def ensure_directories(cls) -> None:
        for directory in (cls.STORAGE_DIR, cls.INPUT_DIR, cls.OUTPUT_DIR, cls.TMP_DIR):
            directory.mkdir(parents=True, exist_ok=True)
