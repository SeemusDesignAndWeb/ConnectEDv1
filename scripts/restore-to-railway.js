#!/usr/bin/env node

/**
 * restore-to-railway.js
 * 
 * Restores data from git history to the Railway volume
 * 
 * Usage:
 *   node scripts/restore-to-railway.js
 * 
 * Requirements:
 *   - Railway CLI installed and authenticated
 *   - Git repository with database in history
 *   - Commit hash with database file (default: fc4b61b)
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Railway service name (hardcoded)
const RAILWAY_SERVICE = 'Website';

// Default commit hash - update this to point to a known good version
const COMMIT_HASH = process.env.RESTORE_COMMIT || 'fc4b61b';
const TEMP_DB_PATH = join(process.cwd(), 'data/database-restore.json');
const REMOTE_DB_PATH = '/app/data/database.json';

console.log('[RESTORE] Starting database restore from git history...');
console.log('[RESTORE] Commit hash:', COMMIT_HASH);
console.log('[RESTORE] Temp path:', TEMP_DB_PATH);
console.log('[RESTORE] Remote path:', REMOTE_DB_PATH);

try {
	// Extract database from git commit
	console.log('[RESTORE] Extracting database from git commit...');
	let dbContent;
	
	try {
		// Try to get database.json from the commit
		dbContent = execSync(`git show ${COMMIT_HASH}:data/database.json`, {
			encoding: 'utf-8',
			stdio: 'pipe'
		});
	} catch (gitError) {
		// Try alternative path
		try {
			dbContent = execSync(`git show ${COMMIT_HASH}:database.json`, {
				encoding: 'utf-8',
				stdio: 'pipe'
			});
		} catch (altError) {
			throw new Error(
				`Failed to extract database from commit ${COMMIT_HASH}. ` +
				`Make sure the commit exists and contains a database.json file.`
			);
		}
	}

	// Validate JSON structure
	console.log('[RESTORE] Validating JSON structure...');
	const dbData = JSON.parse(dbContent);
	if (!dbData || typeof dbData !== 'object') {
		throw new Error('Invalid database structure: must be an object');
	}

	console.log('[RESTORE] Database structure validated successfully');
	console.log('[RESTORE] Pages:', dbData.pages?.length || 0);
	console.log('[RESTORE] Team members:', dbData.team?.length || 0);
	console.log('[RESTORE] Services:', dbData.services?.length || 0);

	// Save temporarily
	console.log('[RESTORE] Saving to temporary file...');
	writeFileSync(TEMP_DB_PATH, dbContent, 'utf-8');
	console.log('[RESTORE] Saved to:', TEMP_DB_PATH);

	// Encode to base64 for Railway CLI (not logged to keep console clean)
	const base64Content = Buffer.from(dbContent).toString('base64');

	// Use Railway CLI to write to volume
	console.log('[RESTORE] Writing to Railway volume...');
	console.log('[RESTORE] Service:', RAILWAY_SERVICE);
	const command = `railway run --service ${RAILWAY_SERVICE} sh -c "echo '${base64Content}' | base64 -d > ${REMOTE_DB_PATH}"`;
	
	execSync(command, { stdio: 'pipe' });

	console.log('[RESTORE] ✅ Database restored successfully to Railway volume!');
	console.log('[RESTORE] Remote path:', REMOTE_DB_PATH);
	console.log('[RESTORE] Temporary file saved at:', TEMP_DB_PATH);
	console.log('[RESTORE] You can delete the temporary file if restore was successful');
} catch (error) {
	console.error('[RESTORE] ❌ Failed to restore database:', error.message);
	if (error.message.includes('git')) {
		console.error('[RESTORE] Make sure you are in a git repository and the commit exists');
		console.error('[RESTORE] You can specify a different commit: RESTORE_COMMIT=<hash> node scripts/restore-to-railway.js');
	} else if (error.message.includes('railway')) {
		console.error('[RESTORE] Make sure Railway CLI is installed and authenticated:');
		console.error('[RESTORE]   1. Install: npm install -g @railway/cli');
		console.error('[RESTORE]   2. Login: railway login');
		console.error('[RESTORE]   3. Link: railway link');
	}
	process.exit(1);
}
