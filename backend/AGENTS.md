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
    main.py              # FastAPI app: GET /api/health, serves the built
                         # NextJS static export at / via a catch-all SPA route
  static/                # NOT committed; populated at image build time with the
                         # NextJS export (frontend/out/). Empty locally.
  tests/
    __init__.py
    test_health.py       # /api/health, /, static asset, SPA fallback tests
```

## API (Part 3 scope)

- `GET /api/health` -> `{"status": "ok"}`.
- `GET /` -> serves `static/index.html` (the built NextJS app).
- `GET /{full_path:path}` -> serves a real static asset (e.g. `_next/static/*`,
  favicon) if it exists under `static/` **and** resolves inside `STATIC_DIR`
  (path traversal via `..` is rejected, falling back to `index.html`),
  otherwise falls back to `index.html` so client-side SPA routes resolve.
  Hashed `_next/static/*` assets are sent with an immutable `Cache-Control`;
  everything else (incl. `index.html`) is `no-cache`.

The static dir is only populated inside the Docker image (the frontend build
copies `frontend/out/` into `backend/static`). For local tests, `test_health.py`
points the module-level `STATIC_DIR`/`INDEX_FILE` at a temp dir with a stub
`index.html`, so serving logic is testable without a built frontend.

## Run / test locally (no Docker)

```bash
uv run --project backend pytest backend/tests -q
uv run --project backend uvicorn app.main:app --reload --port 8000
```

## In the container

The image installs deps into `backend/.venv` and runs uvicorn from the venv
directly (NOT `uv run`, which would re-sync on every start). See the root
`Dockerfile` and `docker-compose.yml`.
