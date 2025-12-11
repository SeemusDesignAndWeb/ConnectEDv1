#!/bin/sh
set -e

# Ensure persistent volume paths exist
mkdir -p /data/images

# Seed database if missing
if [ -f /app/data/database.json ] && [ ! -f /data/database.json ]; then
  cp /app/data/database.json /data/database.json
fi

# Seed images if target is empty and source exists
if [ -d /app/data/images ] && [ -z "$(ls -A /data/images 2>/dev/null)" ]; then
  cp -r /app/data/images/. /data/images/
fi

exec "$@"
