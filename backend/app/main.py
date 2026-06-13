from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

STATIC_DIR = Path(__file__).parent.parent / "static"
INDEX_FILE = STATIC_DIR / "index.html"

app = FastAPI(title="Kanban API")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# Serve the SPA. Individual known assets (index.html, favicon, etc.) are
# returned explicitly so that root navigation works; everything else under
# static assets is served by the StaticFiles mount below.
app.mount(
    "/static",
    StaticFiles(directory=STATIC_DIR),
    name="static",
)


@app.get("/")
def root() -> FileResponse:
    return FileResponse(INDEX_FILE)
