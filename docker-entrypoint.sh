#!/bin/sh
set -e

# Volume is mounted at /app/data (Railway mounts where app writes to relative paths)
VOLUME_PATH="/app/data"
SEED_PATH="/app/data-seed"

echo "[ENTRYPOINT] Starting..."
echo "[ENTRYPOINT] Volume path: $VOLUME_PATH"
echo "[ENTRYPOINT] Seed path: $SEED_PATH"

# Ensure volume directory exists
mkdir -p "$VOLUME_PATH/images"

# Seed database if missing
if [ -f "$SEED_PATH/database.json" ] && [ ! -f "$VOLUME_PATH/database.json" ]; then
  echo "[ENTRYPOINT] Copying database.json to volume..."
  cp "$SEED_PATH/database.json" "$VOLUME_PATH/database.json"
fi

# Seed images if target is empty and source exists
if [ -d "$SEED_PATH/images" ] && [ -z "$(ls -A "$VOLUME_PATH/images" 2>/dev/null)" ]; then
  echo "[ENTRYPOINT] Copying images to volume..."
  cp -r "$SEED_PATH/images/." "$VOLUME_PATH/images/"
fi

echo "[ENTRYPOINT] Volume contents:"
ls -la "$VOLUME_PATH" || true
ls -la "$VOLUME_PATH/images" || true

exec "$@"
