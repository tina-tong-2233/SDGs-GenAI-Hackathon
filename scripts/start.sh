#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${1:-8000}"

printf 'LoopMove\n'
printf '目录: %s\n' "$ROOT_DIR"
printf '打开: http://localhost:%s/\n' "$PORT"
printf '停止服务器: Ctrl+C\n\n'

python3 -m http.server "$PORT" --directory "$ROOT_DIR"
