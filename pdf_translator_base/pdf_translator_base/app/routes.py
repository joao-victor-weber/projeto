from __future__ import annotations

from http import HTTPStatus
from pathlib import Path

from flask import Blueprint, current_app, jsonify, render_template, request, send_file
from werkzeug.utils import secure_filename

from .services.pdf_pipeline import PDFTranslationPipeline

web_bp = Blueprint("web", __name__)
api_bp = Blueprint("api", __name__)

ALLOWED_EXTENSIONS = {"pdf"}


def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@web_bp.get("/")
def home():
    return render_template("index.html")


@api_bp.get("/health")
def healthcheck():
    return jsonify({"status": "ok"}), HTTPStatus.OK


@api_bp.post("/translate")
def translate_pdf():
    uploaded_file = request.files.get("file")
    target_language = request.form.get("target_language", "English").strip()
    source_language = request.form.get("source_language", "auto").strip()
    model = request.form.get("model", current_app.config["GEMINI_MODEL"]).strip()

    if uploaded_file is None or uploaded_file.filename == "":
        return jsonify({"error": "Envie um arquivo PDF no campo 'file'."}), HTTPStatus.BAD_REQUEST

    if not _allowed_file(uploaded_file.filename):
        return jsonify({"error": "Apenas arquivos PDF são aceitos."}), HTTPStatus.BAD_REQUEST

    safe_name = secure_filename(uploaded_file.filename)
    input_path = Path(current_app.config["INPUT_DIR"]) / safe_name
    uploaded_file.save(input_path)

    try:
        pipeline = PDFTranslationPipeline(current_app.config)
        result = pipeline.run(
            pdf_path=input_path,
            target_language=target_language,
            source_language=source_language,
            model=model,
        )
    except ValueError as exc:
        return jsonify({"error": str(exc)}), HTTPStatus.BAD_REQUEST
    except Exception as exc:  # pragma: no cover
        current_app.logger.exception("Erro ao traduzir PDF")
        return jsonify({"error": f"Falha ao processar o PDF: {exc}"}), HTTPStatus.INTERNAL_SERVER_ERROR

    return send_file(
        result.output_pdf,
        as_attachment=True,
        download_name=result.output_pdf.name,
        mimetype="application/pdf",
    )
