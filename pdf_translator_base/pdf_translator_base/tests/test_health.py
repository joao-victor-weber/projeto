from app import create_app


class TestConfig:
    TESTING = True
    SECRET_KEY = "test"
    GEMINI_API_KEY = "test-key"
    GEMINI_MODEL = "gemini-2.5-flash"
    CHUNK_SIZE = 1000
    REQUEST_TIMEOUT_SECONDS = 30
    PDF_PAGE_SIZE = "A4"

    @classmethod
    def ensure_directories(cls):
        return None


def test_healthcheck():
    app = create_app(TestConfig)
    client = app.test_client()

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}
