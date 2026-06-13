#!/usr/bin/env bash
# Start the Kanban app (Mac / Linux).
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose up -d --build
echo "Application demarree sur http://localhost:8000"
