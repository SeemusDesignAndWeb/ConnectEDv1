#!/bin/sh
# Script to seed Railway volume with database and images
# Run with: railway run --environment production --service Website sh < seed-volume.sh

set -e

echo "[SEED] Starting volume seeding..."

# Detect volume mount path
VOLUME_PATH="${RAILWAY_VOLUME_MOUNT_PATH:-/data}"
echo "[SEED] Volume mount path: $VOLUME_PATH"

# Check if volume exists and is writable
if [ ! -d "$VOLUME_PATH" ]; then
  echo "[SEED] ERROR: Volume path $VOLUME_PATH does not exist!"
  echo "[SEED] Checking common mount locations..."
  ls -la / | grep -E "^d" | head -20
  exit 1
fi

# Check if volume is writable
if [ ! -w "$VOLUME_PATH" ]; then
  echo "[SEED] ERROR: Volume path $VOLUME_PATH is not writable!"
  echo "[SEED] Volume mount may not be configured correctly in Railway"
  exit 1
fi

# Find source data location
SOURCE_DATA="/app/data"
if [ ! -d "$SOURCE_DATA" ]; then
  echo "[SEED] Checking for source data in build directory..."
  if [ -d "/app/build/data" ]; then
    SOURCE_DATA="/app/build/data"
  elif [ -d "./data" ]; then
    SOURCE_DATA="./data"
  else
    echo "[SEED] ERROR: Cannot find source data directory!"
    echo "[SEED] Checking /app structure:"
    ls -la /app/ | head -20
    exit 1
  fi
fi

echo "[SEED] Source data location: $SOURCE_DATA"
echo "[SEED] Source contents:"
ls -la "$SOURCE_DATA" || true

# Create images directory in volume
mkdir -p "$VOLUME_PATH/images"
echo "[SEED] Created $VOLUME_PATH/images"

# Copy database
if [ -f "$SOURCE_DATA/database.json" ]; then
  echo "[SEED] Copying database.json..."
  cp -f "$SOURCE_DATA/database.json" "$VOLUME_PATH/database.json"
  echo "[SEED] Database copied successfully"
else
  echo "[SEED] WARNING: database.json not found in $SOURCE_DATA"
fi

# Copy images
if [ -d "$SOURCE_DATA/images" ]; then
  echo "[SEED] Copying images..."
  cp -rf "$SOURCE_DATA/images/." "$VOLUME_PATH/images/"
  echo "[SEED] Images copied successfully"
  echo "[SEED] Image count: $(ls -1 "$VOLUME_PATH/images" | wc -l)"
else
  echo "[SEED] WARNING: images directory not found in $SOURCE_DATA"
fi

# Verify
echo "[SEED] Volume contents after copy:"
ls -la "$VOLUME_PATH" || true
echo "[SEED] Images in volume:"
ls -la "$VOLUME_PATH/images" || true

echo "[SEED] Done!"
