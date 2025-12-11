# Database Migration Scripts

This directory contains scripts for migrating and managing the database between local development and Railway production.

## Overview

The website uses a JSON file-based database stored in different locations:
- **Local Development**: `./data/database.json` (relative path)
- **Production (Railway)**: `/data/database.json` (absolute path on Railway volume)

The Railway volume mounted at `/data` provides persistent storage that survives deployments.

## Prerequisites

1. **Railway CLI** (for scripts that use it):
   ```bash
   npm install -g @railway/cli
   railway login
   railway link
   ```

2. **Environment Variables**:
   - `DATABASE_PATH`: Set to `/data/database.json` in production
   - `ADMIN_PASSWORD`: Required for API-based initialization

## Scripts

### 1. sync-all-to-production.js (Recommended for First-Time Setup)

Syncs both database and images to Railway production in one command.

**Usage:**
```bash
node scripts/sync-all-to-production.js
```

**Requirements:**
- Railway CLI installed and authenticated
- Local database at `./data/database.json`
- Local images at `./data/images`

**How it works:**
1. Runs `sync-database-to-production.js` to copy database
2. Runs `sync-images-to-production.js` to copy images
3. Provides summary of both operations

---

### 3. sync-database-to-production.js

Copies the local database file directly to the Railway volume using Railway CLI.

**Usage:**
```bash
node scripts/sync-database-to-production.js
```

**Requirements:**
- Railway CLI installed and authenticated
- Local database file at `./data/database.json`

**How it works:**
1. Reads local database from `./data/database.json`
2. Validates the JSON structure
3. Uses Railway CLI to copy the file to `/data/database.json` on the volume

---

### 4. sync-images-to-production.js

Copies local images directory to the Railway volume.

**Usage:**
```bash
node scripts/sync-images-to-production.js
```

**Requirements:**
- Railway CLI installed and authenticated
- Local images directory at `./data/images`

**How it works:**
1. Reads all image files from `./data/images`
2. Copies each file to `/data/images` on Railway volume
3. Uses base64 encoding for binary file transfer

---

### 5. write-db-to-railway.js

Runs **inside** the Railway container to write data to the volume.

**Usage:**
```bash
railway run --service ConnectEDv1 node scripts/write-db-to-railway.js
```

**Requirements:**
- Must be run via `railway run` to execute inside the container
- Source file must be prepared at `data/database-restore.json`

**How it works:**
1. Reads from `data/database-restore.json` (must be prepared locally first)
2. Writes directly to `/data/database.json` on the mounted volume
3. Verifies the write was successful

**⚠️ Warning:** This script will overwrite existing data if the database already exists.

---

### 6. restore-to-railway.js

Restores data from git history to the Railway volume.

**Usage:**
```bash
node scripts/restore-to-railway.js
```

**Environment Variables:**
- `RESTORE_COMMIT`: Git commit hash (default: `fc4b61b`)

**Requirements:**
- Railway CLI installed and authenticated
- Git repository with database in history

**How it works:**
1. Extracts database from git commit (default: `fc4b61b`)
2. Saves temporarily to `data/database-restore.json`
3. Uses Railway CLI with base64 encoding to write to `/data/database.json`
4. Useful for recovering from data loss or initializing from a known good state

**Example with custom commit:**
```bash
RESTORE_COMMIT=abc1234 node scripts/restore-to-railway.js
```

---

### 7. init-production-db.js

Calls the init-database API endpoint to initialize the database via HTTP.

**Usage:**
```bash
ADMIN_PASSWORD=your-password node scripts/init-production-db.js
```

**Environment Variables:**
- `PRODUCTION_URL`: The production URL (default: `https://your-site.railway.app`)
- `ADMIN_PASSWORD`: The admin password for authentication (required)

**Requirements:**
- Source file at `data/database-restore.json`
- Production site must be deployed and accessible
- `ADMIN_PASSWORD` environment variable set

**How it works:**
1. Reads from `data/database-restore.json`
2. Sends POST request to `/api/init-database` endpoint
3. Protected by admin password
4. Only initializes if database doesn't exist (safe)

**Example:**
```bash
export ADMIN_PASSWORD=your-secure-password
export PRODUCTION_URL=https://your-site.railway.app
node scripts/init-production-db.js
```

---

## Initial Data Migration: Local to Production

When deploying for the first time, the production volume is empty. Choose one of these methods:

### Method 1: Using sync-all-to-production.js (Recommended - Copies Everything)

Syncs both database and images in one command:

```bash
node scripts/sync-all-to-production.js
```

### Method 2: Using sync-database-to-production.js (Database Only)

```bash
node scripts/sync-database-to-production.js
```

### Method 3: Using sync-images-to-production.js (Images Only)

```bash
node scripts/sync-images-to-production.js
```

### Method 4: Using write-db-to-railway.js

1. Prepare the database file:
   ```bash
   cp data/database.json data/database-restore.json
   ```

2. Run inside Railway container:
   ```bash
   railway run --service ConnectEDv1 node scripts/write-db-to-railway.js
   ```

### Method 5: Using restore-to-railway.js

```bash
node scripts/restore-to-railway.js
```

### Method 6: Using init-production-db.js (Safest - Database Only)

1. Prepare the database file:
   ```bash
   cp data/database.json data/database-restore.json
   ```

2. Initialize via API:
   ```bash
   ADMIN_PASSWORD=your-password node scripts/init-production-db.js
   ```

### Method 7: Using the Init-Database API Endpoint Directly (Database Only)

```bash
curl -X POST https://your-site.railway.app/api/init-database \
  -H "Authorization: Bearer YOUR_ADMIN_PASSWORD" \
  -H "Content-Type: application/json" \
  -d @data/database.json
```

---

## Protection Against Overwriting Production Data

The system has multiple safeguards:

1. **Production Mode Detection**: The `readDatabase()` function detects production mode and **never auto-initializes** in production
2. **Init-Database Endpoint Safety Check**: The endpoint refuses to initialize if a database already exists
3. **No Automatic Initialization**: Initialization scripts are one-time use only and require explicit authentication
4. **Read-Only Operations**: Read operations don't modify data - they only initialize missing fields in memory
5. **Explicit Write Operations**: All data modifications require explicit write operations through authenticated API endpoints

---

## Troubleshooting

### Database Not Found in Production

- **Symptom**: Application fails to start with "Database file not found"
- **Cause**: Volume not mounted or database file missing
- **Solution**: Run one of the initialization scripts to create the database

### Data Not Persisting

- **Symptom**: Changes disappear after deployment
- **Cause**: Writing to wrong path or volume not mounted
- **Solution**: Verify `DATABASE_PATH=/data/database.json` and volume is attached

### Accidental Overwrite Prevention

- **Symptom**: Want to restore data but afraid of overwriting
- **Solution**: The system is designed to prevent this - init scripts check for existing database first

---

## Best Practices

### Initial Setup

1. **First Deployment**: Use one of the migration scripts to populate `/data/database.json`
2. **Verify**: Check that database exists and is readable
3. **Test**: Make a small change via admin interface to verify writes work

### Ongoing Maintenance

1. **Never** run initialization scripts after first setup
2. **Always** backup production database before major changes
3. **Use** admin interface for all data modifications
4. **Monitor** Railway logs for database errors

### Backup Strategy

- Railway volumes can be backed up using Railway CLI
- Database can be exported via admin interface
- Git history can serve as backup (if database was committed at some point)
