# syntax=docker/dockerfile:1

# Single-container image: FastAPI backend serving the static frontend.
# The frontend build stage is added in Part 3.
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
RUN --mount=type=cache,target=/root/.cache/uv \
    cd backend && uv sync --frozen --no-dev


FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app

# Copy the installed virtualenv and the app from the builder.
COPY --from=builder /app/backend /app/backend

ENV PATH="/app/backend/.venv/bin:$PATH" \
    UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1

EXPOSE 8000

# Invoke uvicorn from the installed virtualenv directly. Using `uv run` here
# would re-resolve/re-sync the project on every container start (~20s slowdown).
WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
