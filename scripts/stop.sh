#!/usr/bin/env bash
# Stop the Kanban app (Mac / Linux).
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose down
echo "Application arretee"
