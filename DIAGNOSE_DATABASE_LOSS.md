# Diagnosing Database Loss Issues

## Common Causes

### 1. Railway Volume Not Configured
**Symptom**: Database disappears after every deployment
**Cause**: Volume not attached to the service or not mounted correctly
**Solution**: 
- Check Railway dashboard → Your Service → Volumes
- Ensure a volume is created and attached
- Verify mount path is `/data`

### 2. DATABASE_PATH Environment Variable Missing
**Symptom**: App can't find database or writes to wrong location
**Cause**: `DATABASE_PATH` not set in Railway environment variables
**Solution**:
- Railway dashboard → Your Service → Variables
- Add: `DATABASE_PATH=/data/database.json`
- Redeploy

### 3. Volume Path Mismatch
**Symptom**: Database exists but app can't read it
**Cause**: Volume mounted at different path than expected
**Solution**:
- Check volume mount path in Railway
- Must be exactly `/data`
- Update `DATABASE_PATH` to match if different

### 4. Auto-Initialization in Production
**Symptom**: Database resets to empty structure
**Cause**: Production detection failing, auto-initializing with DEFAULT_DATABASE
**Solution**:
- Ensure `NODE_ENV=production` is set in Railway
- Ensure `DATABASE_PATH` starts with `/` (absolute path)
- Check Railway logs for "[DB] Database file does not exist (development mode)" warnings

### 5. Volume Detached During Redeployment
**Symptom**: Database lost after specific deployment
**Cause**: Volume accidentally detached or service recreated
**Solution**:
- Reattach volume in Railway dashboard
- Re-run initialization script

## Diagnostic Steps

### Step 1: Check Railway Configuration

1. **Verify Volume Exists**:
   - Railway Dashboard → Your Service → Volumes
   - Should see a volume attached
   - Mount path should be `/data`

2. **Check Environment Variables**:
   - Railway Dashboard → Your Service → Variables
   - Must have: `DATABASE_PATH=/data/database.json`
   - Should have: `NODE_ENV=production`

3. **Check Service Logs**:
   - Railway Dashboard → Your Service → Deployments → View Logs
   - Look for database-related errors
   - Look for "[DB]" log messages

### Step 2: Verify Database File Exists

Run this command to check if database exists on Railway:

```bash
railway run --service YourServiceName ls -la /data/
```

Should see `database.json` in the output.

### Step 3: Check Database Path

Run this to see what path the app is using:

```bash
railway run --service YourServiceName node -e "console.log(process.env.DATABASE_PATH || './data/database.json')"
```

Should output: `/data/database.json`

### Step 4: Test Database Read

```bash
railway run --service YourServiceName node -e "const fs = require('fs'); try { const db = JSON.parse(fs.readFileSync(process.env.DATABASE_PATH || '/data/database.json', 'utf-8')); console.log('✅ Database readable'); console.log('Pages:', db.pages?.length || 0); console.log('Icons:', db.icons?.length || 0); } catch(e) { console.error('❌ Error:', e.message); }"
```

## Prevention Checklist

- [ ] Railway volume created and attached to service
- [ ] Volume mount path is `/data`
- [ ] `DATABASE_PATH=/data/database.json` set in Railway variables
- [ ] `NODE_ENV=production` set in Railway variables
- [ ] Database initialized using one of the migration scripts
- [ ] Verified database exists: `railway run ls -la /data/`
- [ ] Tested that app can read database (check logs)

## Quick Fix: Restore Database

If database is lost, restore it:

```bash
# 1. Ensure you have a backup
cp data/database.json data/database-restore.json

# 2. Restore to Railway
ADMIN_PASSWORD=your-password PRODUCTION_URL=https://your-site.railway.app node scripts/init-production-db.js
```

Or use force mode if database exists but is empty:

```bash
FORCE_OVERWRITE=true ADMIN_PASSWORD=your-password PRODUCTION_URL=https://your-site.railway.app node scripts/init-production-db.js
```

## Why This Happens

The database is stored on a Railway **volume**, which is separate from the application code. When you:

1. **Push code to git** → Only code changes, volume persists ✅
2. **Redeploy service** → Volume should persist ✅
3. **Recreate service** → Volume might detach ❌
4. **Volume not configured** → No persistence ❌

The volume is like external storage - it persists across deployments, but only if properly configured.
