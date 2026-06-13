# Backend

FastAPI backend for the Kanban app. Managed with `uv`. Packaged into a single
Docker container that also serves the static frontend at `/`.

## Stack

- Python (3.12 in the container), FastAPI, Uvicorn.
- `httpx` (API client / tests), `openai` (OpenRouter, used from Part 8).
- Tests: pytest + FastAPI `TestClient`.

## Layout

```
backend/
  pyproject.toml         # project + deps; dev group = pytest, pytest-asyncio
  uv.lock                # lockfile (kept in sync; used by Docker with --frozen)
  app/
    __init__.py
    main.py              # FastAPI app: GET /api/health, serves static at /
  static/
    index.html           # hello-world page (French); replaced by the NextJS
                         # static export from Part 3 onward
  tests/
    __init__.py
    test_health.py       # /api/health + / tests
```

## API (Part 2 scope)

- `GET /api/health` -> `{"status": "ok"}`.
- `GET /` -> serves `static/index.html`.
- `/static/*` mounted via `StaticFiles`.

## Run / test locally (no Docker)

```bash
uv run --project backend pytest backend/tests -q
uv run --project backend uvicorn app.main:app --reload --port 8000
```

## In the container

The image installs deps into `backend/.venv` and runs uvicorn from the venv
directly (NOT `uv run`, which would re-sync on every start). See the root
`Dockerfile` and `docker-compose.yml`.
