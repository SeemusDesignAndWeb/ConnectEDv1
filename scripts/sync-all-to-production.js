#!/usr/bin/env node

/**
 * sync-all-to-production.js
 * 
 * Syncs both database and images to Railway production
 * This is a convenience script that runs both sync operations
 * 
 * Usage:
 *   node scripts/sync-all-to-production.js
 * 
 * Requirements:
 *   - Railway CLI installed and authenticated
 *   - Local database at ./data/database.json
 *   - Local images at ./data/images
 */

import { execSync } from 'child_process';
import { join } from 'path';

const SCRIPTS_DIR = join(process.cwd(), 'scripts');

console.log('[SYNC-ALL] Starting full sync to Railway production...');
console.log('[SYNC-ALL] This will sync both database and images');
console.log('');

(async () => {
try {
	// Step 1: Sync database
	console.log('[SYNC-ALL] ========================================');
	console.log('[SYNC-ALL] Step 1: Syncing database...');
	console.log('[SYNC-ALL] ========================================');
	console.log('');
	
	try {
		execSync(`node ${join(SCRIPTS_DIR, 'sync-database-to-production.js')}`, {
			stdio: 'inherit'
		});
		console.log('');
		console.log('[SYNC-ALL] ✅ Database sync completed');
	} catch (dbError) {
		console.error('[SYNC-ALL] ❌ Database sync failed:', dbError.message);
		throw dbError;
	}

	console.log('');
	
	// Step 2: Sync images (from database references)
	console.log('[SYNC-ALL] ========================================');
	console.log('[SYNC-ALL] Step 2: Syncing images (from database references)...');
	console.log('[SYNC-ALL] ========================================');
	console.log('');
	
	try {
		// First try syncing images referenced in database
		execSync(`node ${join(SCRIPTS_DIR, 'sync-images-from-database.js')}`, {
			stdio: 'inherit'
		});
		console.log('');
		console.log('[SYNC-ALL] ✅ Database-referenced images sync completed');
	} catch (imgError) {
		console.error('[SYNC-ALL] ❌ Database-referenced images sync failed:', imgError.message);
		// Try fallback: sync all images
		console.log('[SYNC-ALL] Attempting fallback: syncing all images...');
		try {
			execSync(`node ${join(SCRIPTS_DIR, 'sync-images-to-production.js')}`, {
				stdio: 'inherit'
			});
			console.log('[SYNC-ALL] ✅ All images sync completed (fallback)');
		} catch (fallbackError) {
			console.error('[SYNC-ALL] ❌ Images sync failed:', fallbackError.message);
			console.warn('[SYNC-ALL] ⚠️  Continuing despite image sync failure');
		}
	}

	console.log('');
	console.log('[SYNC-ALL] ========================================');
	console.log('[SYNC-ALL] ✅ Full sync completed!');
	console.log('[SYNC-ALL] ========================================');
} catch (error) {
	console.error('[SYNC-ALL] ❌ Full sync failed:', error.message);
	process.exit(1);
}
})();
