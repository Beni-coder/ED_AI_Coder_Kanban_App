# Plan d'execution du projet (working document for the agent)

This document is the working plan for the agent. It is written in English for
the agent; the **application itself** (all UI copy, labels, errors, system
prompts) must be in **French** per AGENTS.md.

High-level flow: each part is executed in order. Do not start the next part
until the current one passes its success criteria. Each part lists substeps as a
checklist, the tests to write/run, and explicit success criteria.

> Global conventions (apply to every part):
> - No emojis anywhere (code, docs, UI, commits).
> - Keep it simple. No speculative/defensive code. No extra features.
> - French for all user-facing strings in the app.
> - Color scheme from AGENTS.md (yellow `#ecad0a`, blue `#209dd7`, purple
>   `#753991`, navy `#032147`, gray `#888888`).
> - Identify root cause before fixing; prove with evidence.
> - Update the relevant `AGENTS.md` files (frontend/backend/scripts) as code is
>   added so they stay accurate.

---

## Part 1: Plan

Enrich this document and document the starting frontend.

Substeps:
- [x] Enrich docs/PLAN.md with detailed substeps, tests, and success criteria for every part.
- [x] Create `frontend/AGENTS.md` describing the existing demo frontend code.
- [x] Identify root cause of any ambiguity with the user (Q&A round done).

Tests:
- None (documentation only).

Success criteria:
- [ ] User reviews and approves this enriched plan before Part 2 starts.
- [ ] `frontend/AGENTS.md` exists and accurately reflects the current frontend
      files, structure, data model, and test setup.

---

## Part 2: Scaffolding

Set up Docker, a minimal FastAPI backend in `backend/`, and start/stop scripts
in `scripts/`. The backend serves example static HTML at `/` and exposes a tiny
API route to prove end-to-end plumbing.

Substeps:
- [x] Add `backend/pyproject.toml` (managed by `uv`): fastapi, uvicorn, httpx,
      openai (for OpenRouter), pytest, plus any dev tools.
- [x] Add `backend/app/main.py`: FastAPI app that (a) serves static files at `/`
      from a `static/` dir, (b) exposes `GET /api/health` returning JSON, and
      (c) serves a hello-world `static/index.html`.
- [x] Add a root `Dockerfile` (single container): install uv, install backend
      deps, copy backend, expose port. No frontend build yet.
- [x] Add `docker-compose.yml` (or compose spec) to build/run the container and
      map the local port; load `.env` (OPENROUTER_API_KEY) into the container.
- [x] Add OS-specific start/stop scripts in `scripts/`:
      - [x] `start.sh` / `stop.sh` (Mac + Linux)
      - [x] `start.bat` / `stop.bat` (Windows cmd)
      - [x] `start.ps1` / `stop.ps1` (Windows PowerShell)
- [x] Update `backend/AGENTS.md` and `scripts/AGENTS.md` with what was built.

Tests:
- [x] Backend unit test: `GET /api/health` returns 200 and expected JSON
      (pytest + FastAPI TestClient).
- [x] Manual: run start script, open `/` to see hello-world HTML, and
      `/api/health` returns JSON.

Success criteria:
- [x] `start.<ext>` launches the container; `/` returns static hello-world HTML.
- [x] `/api/health` returns JSON from FastAPI.
- [x] `stop.<ext>` cleanly stops and removes the container.
- [x] `.env` is loaded (OPENROUTER_API_KEY available to backend), but `.env` is
      never committed (`.env.example` provided; key passed via compose env,
      optional until Part 8).

---

## Part 3: Add in Frontend

Static-build the existing NextJS frontend and serve it from FastAPI at `/`, so
the demo Kanban board is shown. Comprehensive unit + integration tests.

Substeps:
- [ ] Configure NextJS for static export (`output: "export"` in
      `frontend/next.config.ts`) and set `images: { unoptimized: true }`.
- [ ] Build frontend (`next build`) producing `frontend/out/`.
- [ ] Update Dockerfile: add a Node build stage that builds the frontend and
      copies `out/` into the backend's static dir.
- [ ] Point FastAPI static mount at the built `out/` directory.
- [ ] Verify SPA routing / deep links work under the static server (single-page,
      so a catch-all or `200.html` if needed).
- [ ] Ensure existing Vitest unit tests + Playwright e2e still pass.

Tests:
- [ ] Frontend unit tests (Vitest): keep `kanban.test.ts`, `KanbanBoard.test.tsx`
      green; add tests for any new wiring.
- [ ] Frontend e2e (Playwright): board renders with 5 columns, cards present.
- [ ] Integration: running container serves the Kanban at `/`.

Success criteria:
- [ ] `next build` succeeds and emits `out/`.
- [ ] Visiting `/` in the running container shows the demo Kanban board.
- [ ] All frontend unit + e2e tests pass.

---

## Part 4: Fake user sign-in

Require login with dummy credentials (`user` / `password`) before seeing the
Kanban; allow logout. No real auth/JWT complexity for MVP (keep it simple), but
the DB design (Part 5) must already support multiple users for the future.

Substeps:
- [ ] Decide minimal auth mechanism (e.g., signed session cookie via FastAPI;
      no password hashing needed for the single hardcoded user, but store the
      credential check in one place to swap later).
- [ ] Backend: `POST /api/login` (validate `user`/`password`), `POST /api/logout`,
      `GET /api/me`. Protect board routes behind the session.
- [ ] Frontend: add a French login page; redirect to `/` only when authenticated;
      add a logout control.
- [ ] All new UI strings in French (labels, errors, buttons).

Tests:
- [ ] Backend tests: login success, login failure, protected route rejects
      unauthenticated, `/api/me` returns the user when logged in.
- [ ] Frontend tests: login form validation, redirect flow, logout clears session.
- [ ] E2e: full login -> see board -> logout flow.

Success criteria:
- [ ] Unauthenticated visit redirects to the login page.
- [ ] `user`/`password` logs in; wrong creds are rejected with a French message.
- [ ] Logout returns to the login page.
- [ ] All tests pass.

---

## Part 5: Database modeling

Propose a SQLite schema for the Kanban; save the schema design as
`docs/schema.json` (design doc, not a JSON-file DB); document the DB approach in
`docs/`; get user sign-off.

Substeps:
- [ ] Design tables to support: multiple users (future), one board per user
      (MVP), boards, columns (fixed set, renamable), cards (title, details,
      position within column).
- [ ] Write `docs/schema.json` describing tables/columns/types/relations.
- [ ] Write `docs/DATABASE.md` explaining the SQLite approach, file location,
      and create-if-not-exists rule.
- [ ] No code changes yet design-only; present to user for sign-off.

Tests:
- None (design only).

Success criteria:
- [ ] `docs/schema.json` and `docs/DATABASE.md` exist and are coherent.
- [ ] User signs off on the schema before Part 6.

---

## Part 6: Backend persistence

Add API routes to read/change the Kanban for the logged-in user; create the DB
if it doesn't exist; seed default columns on first run. Thorough backend tests.

Substeps:
- [ ] Add SQLite connection layer (create-if-not-exists, single file under a
      data dir).
- [ ] Implement schema creation from the Part 5 design (migration = create
      tables if absent).
- [ ] Seed default columns for a new user's board.
- [ ] API routes (all auth-gated, scoped to the logged-in user):
      - [ ] `GET /api/board` -> board with columns + cards.
      - [ ] `PATCH /api/columns/{id}` -> rename column.
      - [ ] `POST /api/cards` -> create card (in a column, at a position).
      - [ ] `PATCH /api/cards/{id}` -> edit title/details.
      - [ ] `DELETE /api/cards/{id}` -> delete card.
      - [ ] `POST /api/cards/{id}/move` -> move card across/within columns
            (reorder).
- [ ] Update `backend/AGENTS.md`.

Tests:
- [ ] Unit/integration tests per route (happy path + auth + ownership checks).
- [ ] Test DB is created fresh when absent; default columns seeded.

Success criteria:
- [ ] All routes work for the authenticated user and reject others.
- [ ] DB file created automatically if missing.
- [ ] All backend tests pass.

---

## Part 7: Frontend + Backend integration

Wire the frontend to the backend API so the board is a real persistent Kanban.
Test very thoroughly.

Substeps:
- [ ] Replace in-memory `initialData` with a fetch from `GET /api/board`.
- [ ] Persist rename, add, edit, delete, and move via the matching API routes.
- [ ] Optimize with sensible loading/error states (French).
- [ ] Keep drag-and-drop behavior (dnd-kit) but persist on drop.

Tests:
- [ ] Frontend unit tests updated for async data fetching (mock fetch).
- [ ] E2e: edits persist across a page reload; moves persist.

Success criteria:
- [ ] Board state survives reload (backed by SQLite).
- [ ] All create/rename/edit/delete/move actions persist and reflect in the UI.
- [ ] All tests pass.

---

## Part 8: AI connectivity

Make the backend call OpenRouter (`openai/gpt-oss-120b`). Verify with a simple
`2+2` test.

Substeps:
- [ ] Add OpenRouter client config (base URL, key from env, model name).
- [ ] Add `POST /api/ai/test` (dev/debug only) that asks the model `2+2` and
      returns the raw response.
- [ ] Confirm key/model work end-to-end.

Tests:
- [ ] Backend test: mocked OpenRouter response (do not burn API credits in CI).
- [ ] Manual smoke: call `/api/ai/test` with the real key and confirm a `4`.

Success criteria:
- [ ] Real call to `openai/gpt-oss-120b` returns a valid answer.
- [ ] Key is read from env and never logged/committed.

---

## Part 9: AI Kanban-aware chat (backend)

Always send the AI the current Kanban JSON + conversation history + the user's
question. The model replies with Structured Outputs: a natural-language reply
plus an optional board update. Test thoroughly.

Substeps:
- [ ] Define the structured output JSON schema, e.g.:
      `{ "reply": string, "board_update": { "actions": [ ... ] } | null }`
      where actions describe create/edit/move/delete on cards/columns.
- [ ] Implement `POST /api/ai/chat` that:
      - loads the user's board,
      - builds a French system prompt with the board JSON,
      - sends conversation history,
      - parses the structured response,
      - applies any board_update (reuse Part 6 logic) and persists it.
- [ ] Store short conversation history (in-memory or DB; keep simple).
- [ ] Update `backend/AGENTS.md`.

Tests:
- [ ] Unit test: prompt building includes board JSON + history.
- [ ] Unit test: applying a structured board_update (mocked model) mutates board
      correctly (create/edit/move/delete cases).
- [ ] Unit test: reply with null board_update leaves the board unchanged.

Success criteria:
- [ ] `/api/ai/chat` returns a French reply and optional structured update.
- [ ] Applied updates are persisted and visible via `GET /api/board`.
- [ ] All tests pass.

---

## Part 10: AI chat sidebar (UI)

Add a polished sidebar widget for full AI chat; render the model's reply and
apply its board updates, auto-refreshing the board. All UI in French.

Substeps:
- [ ] Build a sidebar chat component (message list + input), styled per the
      color scheme.
- [ ] Wire to `POST /api/ai/chat`; render the French `reply`.
- [ ] On a non-null `board_update`, refetch the board (or apply locally) so the
      UI refreshes automatically.
- [ ] Show loading/typing state; handle errors (French).

Tests:
- [ ] Frontend unit tests: chat rendering, sending a message, applying a
      board_update refreshes the board (mocked fetch).
- [ ] E2e: user chats, asks to add a card; card appears on the board.

Success criteria:
- [ ] Sidebar chat works end-to-end against the real model.
- [ ] Model-initiated board changes appear automatically in the Kanban.
- [ ] All tests pass.

---

## Status legend

- `[ ]` pending, `[x]` done. Update checkboxes as parts complete.
