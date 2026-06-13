# Frontend (existing demo code)

This directory holds the **frontend-only demo** of the Kanban app. It is not yet
wired to a backend or Docker; that comes in later parts of docs/PLAN.md. It is a
single-board Kanban with drag-and-drop, column rename, and add/remove cards, all
in-memory.

## Stack

- NextJS 16 (App Router), React 19, TypeScript.
- Tailwind CSS v4 (via `@tailwindcss/postcss`), configured in
  `postcss.config.mjs` and `src/app/globals.css`.
- Fonts: Space Grotesk (display) + Manrope (body) via `next/font/google`.
- Drag and drop: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- `clsx` for conditional class names.
- Tests: Vitest + Testing Library (unit/jsdom) and Playwright (e2e).

## Scripts (package.json)

- `npm run dev` local dev server.
- `npm run build` Next build.
- `npm run lint` ESLint.
- `npm run test` / `test:unit` Vitest run.
- `npm run test:unit:watch` Vitest watch.
- `npm run test:e2e` Playwright.
- `npm run test:all` unit then e2e.

## Structure

```
frontend/
  next.config.ts          # Next config (no static export yet; added in Part 3)
  package.json
  tsconfig.json           # path alias "@/*" -> src/*
  postcss.config.mjs
  eslint.config.mjs
  vitest.config.ts
  playwright.config.ts
  public/
  src/
    app/
      layout.tsx          # Root layout: fonts + metadata; html lang="en"
                          # (UI language must become French per AGENTS.md)
      page.tsx            # Home: renders <KanbanBoard />
      globals.css         # Tailwind import + CSS variables (color scheme)
      favicon.ico
    components/
      KanbanBoard.tsx     # Top-level board: holds state, DnD context, handlers
      KanbanColumn.tsx    # A column: droppable + sortable list of cards
      KanbanCard.tsx      # A draggable/editable card (sortable)
      KanbanCardPreview.tsx # Read-only card used in the DragOverlay
      NewCardForm.tsx     # Inline add-card form
      KanbanBoard.test.tsx  # Vitest component tests
    lib/
      kanban.ts           # Types (Card, Column, BoardData), initialData,
                          # moveCard() reorder logic, createId()
      kanban.test.ts      # Vitest unit tests for moveCard
    test/
      setup.ts            # Vitest setup (jest-dom matchers)
      vitest.d.ts         # Test type references
  tests/
    kanban.spec.ts        # Playwright e2e
```

## Data model (`src/lib/kanban.ts`)

- `Card = { id, title, details }`.
- `Column = { id, title, cardIds: string[] }` (ordered list of card ids).
- `BoardData = { columns: Column[], cards: Record<string, Card> }`
  (normalized: cards keyed by id; columns reference card ids).
- `initialData` is a hardcoded demo board with 5 columns and 8 cards.
- `moveCard(columns, activeId, overId)` handles same-column reorder,
  cross-column move, and drop-onto-column (append). Returns a new columns array.
- `createId(prefix)` builds an id like `card-<rand><time>`.

## State and behavior

`KanbanBoard` is a client component (`"use client"`) that owns all board state
via `useState<BoardData>`. Handlers (defined in `KanbanBoard.tsx`) mutate local
state only:
- `handleDragStart` / `handleDragEnd` -> `moveCard`.
- `handleRenameColumn(columnId, title)`.
- `handleAddCard(columnId, title, details)` -> new id via `createId`.
- `handleDeleteCard(columnId, cardId)`.

dnd-kit: `DndContext` with `PointerSensor` (6px activation) and
`closestCorners` collision; each column is `useDroppable`, each card is
`useSortable`; a `DragOverlay` renders `KanbanCardPreview`.

## Color scheme (`src/app/globals.css`)

CSS variables match AGENTS.md:
`--accent-yellow #ecad0a`, `--primary-blue #209dd7`,
`--secondary-purple #753991`, `--navy-dark #032147`, `--gray-text #888888`,
plus `--surface`, `--surface-strong`, `--stroke`, `--shadow`.

## Known changes needed in later parts

- UI language: currently English (e.g. `lang="en"`, "Add a card", "Remove");
  must be translated to French (Part 3 onward).
- Static export: `next.config.ts` needs `output: "export"` for FastAPI serving
  (Part 3).
- Auth gate: add login flow (Part 4).
- Persistence: replace `initialData`/local state with backend API calls
  (Part 7).
- AI sidebar: new chat component wired to `/api/ai/chat` (Part 10).
