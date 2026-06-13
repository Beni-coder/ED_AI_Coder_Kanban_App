@echo off
REM Start the Kanban app (Windows cmd).
cd /d "%~dp0\.."
docker compose up -d --build
echo Application demarree sur http://localhost:8000
