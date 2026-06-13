# Scripts

Start/stop scripts for the Kanban app. They are thin wrappers around
`docker compose`. Each script `cd`s to the project root first.

## Files

- `start.sh` / `stop.sh` - Mac and Linux.
- `start.bat` / `stop.bat` - Windows cmd.
- `start.ps1` / `stop.ps1` - Windows PowerShell.

## What they do

- `start.<ext>` -> `docker compose up -d --build`, then prints the app URL
  (http://localhost:8000).
- `stop.<ext>` -> `docker compose down`.

## Notes

- On Windows, `.bat` and `.ps1` are equivalent; use whichever you prefer.
- The app is served at http://localhost:8000 (port mapped in
  `docker-compose.yml`).
- `OPENROUTER_API_KEY` is read from the project-root `.env` (optional until
  Part 8). Copy `.env.example` to `.env` and fill in the key for AI features.
