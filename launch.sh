#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm ci
fi

echo "Starting portfolio with hot reload on http://localhost:3000"
npx vite --host 0.0.0.0 --port 3000
