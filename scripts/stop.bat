@echo off
REM Stop the Kanban app (Windows cmd).
cd /d "%~dp0\.."
docker compose down
echo Application arretee
