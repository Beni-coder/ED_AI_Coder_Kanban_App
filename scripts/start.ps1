# Start the Kanban app (Windows PowerShell).
Set-Location -Path (Join-Path $PSScriptRoot "..")
docker compose up -d --build
Write-Output "Application demarree sur http://localhost:8000"
