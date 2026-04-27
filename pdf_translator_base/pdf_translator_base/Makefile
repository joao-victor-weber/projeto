install:
	python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt

run:
	python run.py

test:
	pytest -q

docker-up:
	docker compose up --build
