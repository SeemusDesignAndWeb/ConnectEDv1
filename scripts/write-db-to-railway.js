#!/usr/bin/env node

/**
 * write-db-to-railway.js
 * 
 * Runs INSIDE the Railway container to write data to the volume
 * 
 * Usage:
 *   railway run --service Website node scripts/write-db-to-railway.js
 * 
 * Requirements:
 *   - Must be run via `railway run` to execute inside the container where the volume is mounted
 *   - Source file must be prepared at data/database-restore.json
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const SOURCE_DB_PATH = join(process.cwd(), 'data/database-restore.json');
const TARGET_DB_PATH = '/app/data/database.json';

console.log('[WRITE] Starting database write to Railway volume...');
console.log('[WRITE] Source path:', SOURCE_DB_PATH);
console.log('[WRITE] Target path:', TARGET_DB_PATH);

(async () => {
try {
	// Check if source file exists
	if (!existsSync(SOURCE_DB_PATH)) {
		throw new Error(`Source database file not found at ${SOURCE_DB_PATH}`);
	}

	// Read source database
	console.log('[WRITE] Reading source database...');
	const dbContent = readFileSync(SOURCE_DB_PATH, 'utf-8');

	// Validate JSON structure
	console.log('[WRITE] Validating JSON structure...');
	const dbData = JSON.parse(dbContent);
	if (!dbData || typeof dbData !== 'object') {
		throw new Error('Invalid database structure: must be an object');
	}

	console.log('[WRITE] Database structure validated successfully');
	console.log('[WRITE] Pages:', dbData.pages?.length || 0);
	console.log('[WRITE] Team members:', dbData.team?.length || 0);
	console.log('[WRITE] Services:', dbData.services?.length || 0);

	// Check if target already exists (safety check)
	if (existsSync(TARGET_DB_PATH)) {
		console.warn('[WRITE] ⚠️  WARNING: Target database already exists at:', TARGET_DB_PATH);
		console.warn('[WRITE] This script will overwrite existing data!');
		console.warn('[WRITE] If you want to preserve existing data, use the init-database API endpoint instead.');
		console.warn('[WRITE] Continuing in 3 seconds... (Ctrl+C to cancel)');
		// Wait 3 seconds
		await new Promise(resolve => setTimeout(resolve, 3000));
	}

	// Write to Railway volume
	console.log('[WRITE] Writing to Railway volume...');
	writeFileSync(TARGET_DB_PATH, dbContent, 'utf-8');

	// Verify the write was successful
	console.log('[WRITE] Verifying write...');
	if (!existsSync(TARGET_DB_PATH)) {
		throw new Error('Write verification failed: file not found after write');
	}

	const verifyContent = readFileSync(TARGET_DB_PATH, 'utf-8');
	const verifyData = JSON.parse(verifyContent);
	if (!verifyData || typeof verifyData !== 'object') {
		throw new Error('Write verification failed: invalid JSON after write');
	}

	console.log('[WRITE] ✅ Database written successfully to Railway volume!');
	console.log('[WRITE] Target path:', TARGET_DB_PATH);
	console.log('[WRITE] File size:', verifyContent.length, 'bytes');
} catch (error) {
	console.error('[WRITE] ❌ Failed to write database:', error.message);
	if (error.code === 'ENOENT') {
		console.error('[WRITE] Make sure the source database file exists at:', SOURCE_DB_PATH);
		console.error('[WRITE] Prepare the file locally first, then run this script via Railway CLI');
	} else if (error.message.includes('volume')) {
		console.error('[WRITE] Make sure the Railway volume is mounted at /app/data');
	}
	process.exit(1);
}
})();
