# Database Migration System - Implementation Summary

This document summarizes the rebuilt data upload and migration system based on the proven Railway volume pattern.

## What Changed

### 1. Database Module (`src/lib/database.js`)

**Before:**
- Used `DATA_STORE` and `RAILWAY_VOLUME_MOUNT_PATH` environment variables
- Complex production detection logic
- Multiple fallback paths

**After:**
- Uses `DATABASE_PATH` environment variable (matches the proven pattern)
- Simple production detection: checks if path starts with `/`
- Clean path resolution: relative paths for local, absolute for production
- **Critical Safety**: Never auto-initializes in production - throws error instead

### 2. Init-Database API Endpoint (`src/routes/api/init-database/+server.js`)

**Before:**
- Only initialized with default structure
- No body data acceptance

**After:**
- Accepts POST body data to initialize with custom database
- **Safety Check**: Refuses to initialize if database already exists (returns 400)
- Supports both default and custom initialization
- Better error messages

### 3. Migration Scripts (`scripts/`)

Created four migration scripts following the proven pattern:

1. **sync-database-to-production.js** - Direct Railway CLI sync
2. **write-db-to-railway.js** - Runs inside Railway container
3. **restore-to-railway.js** - Restores from git history
4. **init-production-db.js** - Uses API endpoint (safest)

## Environment Variables

### Production Setup

Set in Railway environment variables:

```bash
DATABASE_PATH=/data/database.json
ADMIN_PASSWORD=your-secure-password
```

### Local Development

No environment variables needed (defaults to `./data/database.json`), or optionally:

```bash
DATABASE_PATH=./data/database.json
```

## Railway Volume Configuration

1. **Volume Creation**: Create a Railway volume named `data-storage` in Railway dashboard
2. **Mount Path**: Mount the volume at `/data` (must be exactly `/data`)
3. **Environment Variable**: Set `DATABASE_PATH=/data/database.json` in production

## Initial Data Migration

Choose one method for first-time setup:

### Method 1: API Endpoint (Recommended - Safest)

```bash
# Prepare database file
cp data/database.json data/database-restore.json

# Initialize via API
ADMIN_PASSWORD=your-password node scripts/init-production-db.js
```

### Method 2: Railway CLI Direct

```bash
node scripts/sync-database-to-production.js
```

### Method 3: Inside Container

```bash
# Prepare database file
cp data/database.json data/database-restore.json

# Run inside container
railway run --service ConnectEDv1 node scripts/write-db-to-railway.js
```

### Method 4: From Git History

```bash
node scripts/restore-to-railway.js
```

### Method 5: Direct cURL

```bash
curl -X POST https://your-site.railway.app/api/init-database \
  -H "Authorization: Bearer YOUR_ADMIN_PASSWORD" \
  -H "Content-Type: application/json" \
  -d @data/database.json
```

## Protection Mechanisms

The system has multiple safeguards to prevent data loss:

1. **Production Detection**: `readDatabase()` throws error instead of creating empty DB in production
2. **Init Endpoint Safety**: Refuses to initialize if database exists
3. **No Auto-Init**: Scripts are one-time use only
4. **Authentication Required**: All init operations require admin password
5. **Explicit Writes Only**: No automatic background writes

## Testing

### Local Development

1. Database auto-initializes if missing
2. All operations work normally
3. Path: `./data/database.json`

### Production

1. Database must exist before app starts
2. Missing database causes startup failure (by design)
3. Path: `/data/database.json` (on Railway volume)

## Migration Checklist

- [x] Rewrite `database.js` to use `DATABASE_PATH`
- [x] Update `init-database` endpoint with safety checks
- [x] Create migration scripts
- [x] Add documentation
- [ ] Set `DATABASE_PATH=/data/database.json` in Railway
- [ ] Create and mount Railway volume at `/data`
- [ ] Run initial migration script
- [ ] Verify database exists and is readable
- [ ] Test admin interface writes

## Troubleshooting

### "Database file not found" in Production

**Cause**: Volume not mounted or database not initialized

**Solution**: 
1. Verify volume is mounted at `/data`
2. Verify `DATABASE_PATH=/data/database.json` is set
3. Run one of the migration scripts

### "Database already exists" when trying to init

**Cause**: Database was already initialized

**Solution**: This is expected behavior - the system is protecting existing data. If you need to reset, manually delete the database file first (use Railway CLI or dashboard).

### Changes not persisting

**Cause**: Writing to wrong path or volume not mounted

**Solution**:
1. Check `DATABASE_PATH` environment variable
2. Verify volume is attached in Railway dashboard
3. Check Railway logs for database path

## Files Modified

- `src/lib/database.js` - Complete rewrite
- `src/routes/api/init-database/+server.js` - Enhanced with body data support and safety checks

## Files Created

- `scripts/sync-database-to-production.js`
- `scripts/write-db-to-railway.js`
- `scripts/restore-to-railway.js`
- `scripts/init-production-db.js`
- `scripts/README.md` - Detailed script documentation
- `DATABASE_MIGRATION.md` - This file

## Next Steps

1. **Deploy to Railway** with the new code
2. **Set Environment Variables** in Railway dashboard
3. **Create and Mount Volume** at `/data`
4. **Run Initial Migration** using one of the scripts
5. **Verify** database is accessible and writable
6. **Test** admin interface to ensure writes work

## Notes

- Images storage uses a separate path (`IMAGE_STORE`) and is not affected by these changes
- The old `DATA_STORE` and `RAILWAY_VOLUME_MOUNT_PATH` variables are no longer used for database
- All existing API endpoints continue to work without changes
