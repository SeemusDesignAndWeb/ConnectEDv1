#!/bin/sh
set -e

# Detect Railway volume mount path, default to /data
VOLUME_PATH="${RAILWAY_VOLUME_MOUNT_PATH:-/data}"

echo "[ENTRYPOINT] Volume mount path: $VOLUME_PATH"

# Ensure persistent volume paths exist
mkdir -p "$VOLUME_PATH/images"

# Seed database if missing
if [ -f /app/data/database.json ] && [ ! -f "$VOLUME_PATH/database.json" ]; then
  echo "[ENTRYPOINT] Copying database.json to volume..."
  cp /app/data/database.json "$VOLUME_PATH/database.json"
fi

# Seed images if target is empty and source exists
if [ -d /app/data/images ] && [ -z "$(ls -A "$VOLUME_PATH/images" 2>/dev/null)" ]; then
  echo "[ENTRYPOINT] Copying images to volume..."
  cp -r /app/data/images/. "$VOLUME_PATH/images/"
fi

echo "[ENTRYPOINT] Volume contents:"
ls -la "$VOLUME_PATH" || true
ls -la "$VOLUME_PATH/images" || true

exec "$@"
