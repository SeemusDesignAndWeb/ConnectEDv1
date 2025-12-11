# Step-by-Step Migration Guide

## Prerequisites Checklist

Before running the migration, ensure:

- [ ] Your site is deployed to Railway
- [ ] Railway volume is created and mounted at `/data`
- [ ] `DATABASE_PATH=/data/database.json` is set in Railway environment variables
- [ ] `ADMIN_PASSWORD` is set in Railway environment variables
- [ ] `IMAGE_STORE=/data/images` is set in Railway environment variables (for images)
- [ ] Your production site is accessible (you have the URL)

**Important:** The database contains references to images (like `/images/researcher.jpg`). These images must also be copied to `/data/images` on the Railway volume for them to work in production.

## Method 1: Using sync-all-to-production.js (Recommended - Copies Everything)

This method syncs both database and images in one command.

```bash
node scripts/sync-all-to-production.js
```

This will:
1. Copy your local `data/database.json` to `/data/database.json` on Railway
2. Extract all image references from the database
3. Copy those specific images to `/data/images/` on Railway

**Note:** Requires Railway CLI to be set up.

---

## Method 2: Using init-production-db.js (Database Only - Safest)

This method uses the API endpoint which has built-in safety checks. **You'll need to sync images separately.**

### Step 1: Prepare the database file

Copy your local database to the restore location:

```bash
cd /Users/johnwatson/Library/CloudStorage/OneDrive-Personal/Web/ConnectEDv1
cp data/database.json data/database-restore.json
```

### Step 2: Get your production URL

Find your Railway site URL. It will be something like:
- `https://your-app-name.up.railway.app` or
- Your custom domain if configured

### Step 3: Get your admin password

This is the `ADMIN_PASSWORD` you set in Railway environment variables.

### Step 4: Run the migration script

```bash
# Set environment variables and run
ADMIN_PASSWORD=your-actual-password \
PRODUCTION_URL=https://your-site.railway.app \
node scripts/init-production-db.js
```

**Example:**
```bash
ADMIN_PASSWORD=TheRootOfTheTree! \
PRODUCTION_URL=https://sveltekit-production-a5dd.up.railway.app \
node scripts/init-production-db.js
```

### Step 5: Sync Images Separately

After initializing the database, you need to sync the images:

```bash
# Option A: Sync only images referenced in database
node scripts/sync-images-from-database.js

# Option B: Sync all images in data/images directory
node scripts/sync-images-to-production.js
```

### Step 6: Verify

The script will output:
- ✅ Success message if database was initialized
- ℹ️ Info message if database already exists (this is safe)

---

## Method 3: Using sync-all-to-production.js (Recommended - Copies Everything)

This method syncs both database and images in one command.

```bash
node scripts/sync-all-to-production.js
```

This will:
1. Copy your local `data/database.json` to `/data/database.json` on Railway
2. Copy all files from `data/images/` to `/data/images/` on Railway

---

## Method 3: Using sync-database-to-production.js (Database Only)

This method uses Railway CLI to directly copy the database file.

### Step 1: Install Railway CLI (if not already installed)

```bash
npm install -g @railway/cli
```

### Step 2: Authenticate with Railway

```bash
railway login
```

### Step 3: Link to your project

```bash
railway link
```

Select your ConnectEDv1 project when prompted.

### Step 4: Run the sync script

```bash
node scripts/sync-database-to-production.js
```

This will:
1. Read your local `data/database.json`
2. Validate it
3. Copy it directly to `/data/database.json` on Railway volume

**After syncing database, sync images:**
```bash
node scripts/sync-images-from-database.js
```

---

## Method 4: Using sync-images-from-database.js (Images Only - Smart)

This script extracts image references from your database and copies only those specific images.

**Usage:**
```bash
node scripts/sync-images-from-database.js
```

**How it works:**
1. Reads your database (from `data/database.json` or `data/database-restore.json`)
2. Extracts all image references (like `/images/researcher.jpg`, `/images/career.jpg`)
3. Verifies those images exist locally
4. Copies only the referenced images to `/data/images/` on Railway

This is more efficient than copying all images if you only need the ones referenced in the database.

**Example output:**
```
[SYNC-IMAGES-DB] Found 5 unique image references:
[SYNC-IMAGES-DB]   - researcher.jpg
[SYNC-IMAGES-DB]   - career.jpg
[SYNC-IMAGES-DB]   - university.jpg
[SYNC-IMAGES-DB]   - dashboardpc.jpg
[SYNC-IMAGES-DB]   - logo_colour.svg
```

---

## Method 5: Using sync-images-to-production.js (Images Only - All Images)

This method copies all images from the local images directory.

```bash
node scripts/sync-images-to-production.js
```

This will copy all files from `data/images/` to `/data/images/` on Railway volume.

---

## Method 6: Using write-db-to-railway.js

This runs inside the Railway container.

### Step 1: Prepare the database file

```bash
cp data/database.json data/database-restore.json
```

### Step 2: Run inside Railway container

```bash
railway run --service ConnectEDv1 node scripts/write-db-to-railway.js
```

**Note:** This will overwrite existing data if the database already exists (with a 3-second warning).

---

## Method 6: Direct cURL (Quick Test - Database Only)

If you just want to test quickly:

```bash
curl -X POST https://your-site.railway.app/api/init-database \
  -H "Authorization: Bearer YOUR_ADMIN_PASSWORD" \
  -H "Content-Type: application/json" \
  -d @data/database.json
```

Replace:
- `https://your-site.railway.app` with your actual Railway URL
- `YOUR_ADMIN_PASSWORD` with your actual admin password

---

## Troubleshooting

### "Database already exists" message

**This is GOOD!** It means:
- The database was already initialized
- The system is protecting your existing data
- No action needed

### "ADMIN_PASSWORD environment variable not set"

Make sure you're setting it in the command:
```bash
ADMIN_PASSWORD=your-password node scripts/init-production-db.js
```

Or export it first:
```bash
export ADMIN_PASSWORD=your-password
node scripts/init-production-db.js
```

### "Source database file not found"

Make sure you've copied the database file:
```bash
cp data/database.json data/database-restore.json
```

### "Failed to connect" or network errors

- Check that your Railway site is deployed and running
- Verify the `PRODUCTION_URL` is correct
- Check Railway logs for any errors

### Railway CLI not found

Install it:
```bash
npm install -g @railway/cli
```

Then authenticate:
```bash
railway login
railway link
```

---

## Verification After Migration

After running the migration, verify it worked:

1. **Check Railway Logs**: Look for successful database initialization messages
2. **Verify Images**: Check that images are accessible at `/images/[filename]` on your production site
3. **Test Admin Interface**: Log into your admin panel and make a small test change
4. **Check Database Path**: The GET endpoint can show you the database status:

```bash
curl -X GET https://your-site.railway.app/api/init-database \
  -H "Authorization: Bearer YOUR_ADMIN_PASSWORD"
```

This will return:
```json
{
  "path": "/data/database.json",
  "exists": true,
  "environment": "production"
}
```

---

## Quick Reference

**Most Common Commands:**

**For everything (database + images) - Recommended:**
```bash
node scripts/sync-all-to-production.js
```

**For database only (API method):**
```bash
cp data/database.json data/database-restore.json
ADMIN_PASSWORD=your-password PRODUCTION_URL=https://your-site.railway.app node scripts/init-production-db.js
# Then sync images:
node scripts/sync-images-from-database.js
```

**For database only (Railway CLI):**
```bash
node scripts/sync-database-to-production.js
# Then sync images:
node scripts/sync-images-from-database.js
```

**For images only (smart - only referenced images):**
```bash
node scripts/sync-images-from-database.js
```

**For images only (all images):**
```bash
node scripts/sync-images-to-production.js
```
