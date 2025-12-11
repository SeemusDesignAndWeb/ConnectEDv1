#!/bin/sh
# Don't exit on errors - we want to continue even if volume operations fail

# Volume is mounted at /app/data (Railway mounts where app writes to relative paths)
VOLUME_PATH="/app/data"
SEED_PATH="/app/data-seed"

echo "[ENTRYPOINT] Starting..."
echo "[ENTRYPOINT] Volume path: $VOLUME_PATH"
echo "[ENTRYPOINT] Seed path: $SEED_PATH"

# Check if seed data exists
if [ ! -d "$SEED_PATH" ] && [ ! -f "$SEED_PATH/database.json" ]; then
  echo "[ENTRYPOINT] WARNING: Seed path $SEED_PATH not found, checking /app/data..."
  if [ -d "/app/data" ] && [ -f "/app/data/database.json" ]; then
    SEED_PATH="/app/data"
    echo "[ENTRYPOINT] Using /app/data as seed path"
  fi
fi

# Check if volume is writable
if [ -d "$VOLUME_PATH" ]; then
  if [ -w "$VOLUME_PATH" ]; then
    echo "[ENTRYPOINT] Volume is writable at $VOLUME_PATH"
  else
    echo "[ENTRYPOINT] WARNING: Volume exists but is NOT writable at $VOLUME_PATH"
  fi
else
  echo "[ENTRYPOINT] WARNING: Volume directory does not exist at $VOLUME_PATH"
fi

# Ensure volume directory exists (may fail if volume not mounted, that's ok)
mkdir -p "$VOLUME_PATH/images" 2>/dev/null || echo "[ENTRYPOINT] Could not create $VOLUME_PATH/images (volume may not be mounted yet)"

# Seed database - always copy if seed exists (overwrite if volume is empty or corrupted)
if [ -f "$SEED_PATH/database.json" ]; then
  if [ ! -f "$VOLUME_PATH/database.json" ] || [ ! -s "$VOLUME_PATH/database.json" ]; then
    echo "[ENTRYPOINT] Copying database.json to volume..."
    cp -f "$SEED_PATH/database.json" "$VOLUME_PATH/database.json" 2>/dev/null && echo "[ENTRYPOINT] Database copied successfully" || echo "[ENTRYPOINT] ERROR: Failed to copy database.json - volume may not be writable"
  else
    echo "[ENTRYPOINT] Database.json already exists in volume (skipping copy)"
  fi
else
  echo "[ENTRYPOINT] ERROR: Seed database.json not found at $SEED_PATH/database.json"
  echo "[ENTRYPOINT] Checking what exists at $SEED_PATH:"
  ls -la "$SEED_PATH" 2>/dev/null || echo "[ENTRYPOINT] $SEED_PATH does not exist"
fi

# Seed images - always copy if seed exists and volume target is empty
if [ -d "$SEED_PATH/images" ]; then
  IMAGE_COUNT=$(ls -A "$VOLUME_PATH/images" 2>/dev/null | wc -l || echo "0")
  if [ "$IMAGE_COUNT" -eq 0 ]; then
    echo "[ENTRYPOINT] Copying images to volume..."
    cp -rf "$SEED_PATH/images/." "$VOLUME_PATH/images/" 2>/dev/null && echo "[ENTRYPOINT] Images copied successfully ($(ls -1 "$VOLUME_PATH/images" 2>/dev/null | wc -l) files)" || echo "[ENTRYPOINT] ERROR: Failed to copy images - volume may not be writable"
  else
    echo "[ENTRYPOINT] Images already exist in volume ($IMAGE_COUNT files, skipping copy)"
  fi
else
  echo "[ENTRYPOINT] WARNING: Seed images directory not found at $SEED_PATH/images"
fi

echo "[ENTRYPOINT] Volume contents:"
ls -la "$VOLUME_PATH" 2>/dev/null || echo "[ENTRYPOINT] Cannot list $VOLUME_PATH"
ls -la "$VOLUME_PATH/images" 2>/dev/null || echo "[ENTRYPOINT] Cannot list $VOLUME_PATH/images"

echo "[ENTRYPOINT] Starting application..."

exec "$@"
