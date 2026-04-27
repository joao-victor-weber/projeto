from flask import Flask

from .config import Config
from .routes import web_bp, api_bp


def create_app(config_object=Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_object)

    config_object.ensure_directories()

    app.register_blueprint(web_bp)
    app.register_blueprint(api_bp, url_prefix="/api/v1")

    return app
