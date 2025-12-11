# Quick Start - Running Migration Scripts

## Prerequisites

1. Railway CLI installed and authenticated:
   ```bash
   railway login
   railway link
   ```

2. Know your Railway service name (check with `railway status` or in Railway dashboard)

## Running the Scripts

### Option 1: Sync Everything (Database + Images)

```bash
# Set your service name (replace 'your-service-name' with actual service)
export RAILWAY_SERVICE=your-service-name

# Run the combined sync
node scripts/sync-all-to-production.js
```

### Option 2: Sync Database Only

```bash
RAILWAY_SERVICE=your-service-name node scripts/sync-database-to-production.js
```

### Option 3: Sync Images Only (from database references)

```bash
RAILWAY_SERVICE=your-service-name node scripts/sync-images-from-database.js
```

### Option 4: Sync All Images (entire directory)

```bash
RAILWAY_SERVICE=your-service-name node scripts/sync-images-to-production.js
```

## Example

If your service name is `ConnectEDv1`:

```bash
export RAILWAY_SERVICE=ConnectEDv1
node scripts/sync-all-to-production.js
```

Or in one line:

```bash
RAILWAY_SERVICE=ConnectEDv1 node scripts/sync-all-to-production.js
```

## Finding Your Service Name

Run this to see your Railway project details:
```bash
railway status
```

The service name is usually visible in the Railway dashboard under your project's services.
