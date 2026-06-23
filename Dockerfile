# syntax=docker/dockerfile:1

# Single-container image: FastAPI backend serving the static frontend.
#
# Stage 1 builds the NextJS static export; stage 2 installs the Python deps;
# stage 3 is the slim runtime that serves the built frontend from FastAPI.

# --- Stage 1: frontend static build ---
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Python dependency builder ---
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

ENV UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1 \
    UV_PYTHON_DOWNLOADS=never

WORKDIR /app

# Install dependencies first (better layer caching).
COPY backend/pyproject.toml backend/uv.lock* ./backend/
RUN --mount=type=cache,target=/root/.cache/uv \
    cd backend && uv sync --frozen --no-install-project --no-dev

# Copy the application source and install the project itself.
COPY backend/ ./backend/

# Populate the static dir with the built frontend export.
COPY --from=frontend /app/frontend/out ./backend/static

RUN --mount=type=cache,target=/root/.cache/uv \
    cd backend && uv sync --frozen --no-dev


# --- Stage 3: runtime ---
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app

# Copy the installed virtualenv and the app (incl. built static frontend) from
# the builder.
COPY --from=builder /app/backend /app/backend

ENV PATH="/app/backend/.venv/bin:$PATH" \
    UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1

# Run the server as a non-root user.
RUN useradd --system --uid 1001 --home-dir /app app \
    && chown -R app /app
USER app

EXPOSE 8000

# Invoke uvicorn from the installed virtualenv directly. Using `uv run` here
# would re-resolve/re-sync the project on every container start (~20s slowdown).
WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
