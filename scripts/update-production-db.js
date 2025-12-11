#!/usr/bin/env node

/**
 * update-production-db.js
 * 
 * Updates/overwrites the production database with local data
 * WARNING: This will overwrite existing production data!
 * 
 * Usage:
 *   node scripts/update-production-db.js
 * 
 * Environment Variables:
 *   - PRODUCTION_URL: The production URL
 *   - ADMIN_PASSWORD: The admin password for authentication
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { env } from 'process';

const SOURCE_DB_PATH = join(process.cwd(), 'data/database.json');
const PRODUCTION_URL = env.PRODUCTION_URL || env.RAILWAY_PUBLIC_DOMAIN || 'https://sveltekit-production-a5dd.up.railway.app';
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

console.log('[UPDATE] Starting production database update...');
console.log('[UPDATE] WARNING: This will overwrite existing production data!');
console.log('[UPDATE] Source path:', SOURCE_DB_PATH);
console.log('[UPDATE] Production URL:', PRODUCTION_URL);
console.log('');

(async () => {
	try {
		// Check for admin password
		if (!ADMIN_PASSWORD) {
			throw new Error(
				'ADMIN_PASSWORD environment variable not set. ' +
				'Set it before running this script: ADMIN_PASSWORD=your-password node scripts/update-production-db.js'
			);
		}

		// Check if source file exists
		if (!existsSync(SOURCE_DB_PATH)) {
			throw new Error(`Source database file not found at ${SOURCE_DB_PATH}`);
		}

		// Read source database
		console.log('[UPDATE] Reading source database...');
		const dbContent = readFileSync(SOURCE_DB_PATH, 'utf-8');
		const dbData = JSON.parse(dbContent);

		console.log('[UPDATE] Database structure:');
		console.log('[UPDATE]   Pages:', dbData.pages?.length || 0);
		console.log('[UPDATE]   Team members:', dbData.team?.length || 0);
		console.log('[UPDATE]   Services:', dbData.services?.length || 0);
		console.log('[UPDATE]   Icons:', dbData.icons?.length || 0);
		console.log('');

		// First, delete the existing database by calling a delete endpoint (if it exists)
		// Or we can use the admin API to write directly
		// For now, let's use the pages API to update
		
		console.log('[UPDATE] Updating database via admin API...');
		
		// Check if there's an admin API endpoint for updating the entire database
		// If not, we'll need to update pages individually or create a new endpoint
		
		// For now, let's try using the init-database endpoint but first delete the file
		// Actually, the safest way is to use Railway CLI to delete the file, then re-init
		
		console.log('[UPDATE] ⚠️  This script requires manual deletion of the database file first.');
		console.log('[UPDATE]    Option 1: Delete via Railway dashboard');
		console.log('[UPDATE]    Option 2: Use Railway CLI:');
		console.log('[UPDATE]      railway run --service Website rm /data/database.json');
		console.log('[UPDATE]    Then run: node scripts/init-production-db.js');
		console.log('');
		console.log('[UPDATE] Alternatively, you can update individual pages via the admin interface.');
		
	} catch (error) {
		console.error('[UPDATE] ❌ Failed:', error.message);
		process.exit(1);
	}
})();
