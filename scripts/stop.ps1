# Stop the Kanban app (Windows PowerShell).
Set-Location -Path (Join-Path $PSScriptRoot "..")
docker compose down
Write-Output "Application arretee"
