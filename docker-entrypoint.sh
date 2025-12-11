#!/bin/sh
# This entrypoint is no longer used
# Data initialization is handled by migration scripts (init-production-db.js, etc.)
# The Dockerfile now runs the app directly without this entrypoint

exec "$@"
