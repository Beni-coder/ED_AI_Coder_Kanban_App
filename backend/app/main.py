from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse

# Static dir is populated at image build time with the NextJS static export
# (frontend/out/). Nothing is committed here, so it is empty locally and only
# exists inside the Docker image.
STATIC_DIR = Path(__file__).parent.parent / "static"
INDEX_FILE = STATIC_DIR / "index.html"

# NextJS emits content-hashed, immutable assets under this prefix; they are safe
# to cache aggressively. Everything else (incl. index.html) must not be cached.
IMMUTABLE_PREFIX = "_next/static/"

app = FastAPI(title="Kanban API")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
def root() -> FileResponse:
    return FileResponse(INDEX_FILE, headers={"Cache-Control": "no-cache"})


@app.get("/{full_path:path}")
def spa(full_path: str) -> FileResponse:
    # Serve a real static asset (e.g. _next/static/*, favicon) if it exists and
    # stays inside STATIC_DIR, otherwise fall back to index.html so client-side
    # SPA routes resolve. Resolving and confining to STATIC_DIR prevents path
    # traversal via ".." segments in the request path.
    base = STATIC_DIR.resolve()
    candidate = (STATIC_DIR / full_path).resolve()
    if candidate.is_file() and base in candidate.parents:
        cache_control = (
            "public, max-age=31536000, immutable"
            if full_path.startswith(IMMUTABLE_PREFIX)
            else "no-cache"
        )
        return FileResponse(candidate, headers={"Cache-Control": cache_control})
    return FileResponse(INDEX_FILE, headers={"Cache-Control": "no-cache"})
