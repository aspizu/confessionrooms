#!/usr/bin/bash
set -euo pipefail
git pull
cd ~/confessionrooms/frontend
bun install
mkdir -p /var/www/html/confessionrooms
bun run build --outDir /var/www/html/confessionrooms
chown -R www-data:www-data /var/www/html/confessionrooms
chmod -R 755 /var/www/html/confessionrooms
cd ..
cd backend
set +e
kill -9 "$(< /tmp/confessionrooms_backend.pid)"
set -e
uv sync
uv pip install -e .
uv run python -m gunicorn src.confessionrooms:app \
  -k uvicorn.workers.UvicornWorker \
  -b unix:/tmp/confessionrooms_backend.sock \
  --log-file /var/log/gunicorn.log \
  --pid /tmp/confessionrooms_backend.pid > /dev/null 2>&1 & disown
