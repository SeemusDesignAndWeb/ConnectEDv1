#!/usr/bin/env node

/**
 * init-production-db.js
 * 
 * Calls the init-database API endpoint to initialize production database
 * 
 * Usage:
 *   node scripts/init-production-db.js
 * 
 * Environment Variables:
 *   - PRODUCTION_URL: The production URL (default: https://your-site.railway.app)
 *   - ADMIN_PASSWORD: The admin password for authentication
 * 
 * Requirements:
 *   - Source file at data/database-restore.json
 *   - Production site must be deployed and accessible
 *   - ADMIN_PASSWORD environment variable set
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { env } from 'process';

const SOURCE_DB_PATH = join(process.cwd(), 'data/database-restore.json');
const PRODUCTION_URL = env.PRODUCTION_URL || env.RAILWAY_PUBLIC_DOMAIN || 'https://your-site.railway.app';
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

console.log('[INIT] Starting production database initialization...');
console.log('[INIT] Source path:', SOURCE_DB_PATH);
console.log('[INIT] Production URL:', PRODUCTION_URL);

(async () => {
try {
	// Check for admin password
	if (!ADMIN_PASSWORD) {
		throw new Error(
			'ADMIN_PASSWORD environment variable not set. ' +
			'Set it before running this script: ADMIN_PASSWORD=your-password node scripts/init-production-db.js'
		);
	}

	// Check if source file exists
	if (!existsSync(SOURCE_DB_PATH)) {
		throw new Error(`Source database file not found at ${SOURCE_DB_PATH}`);
	}

	// Read source database
	console.log('[INIT] Reading source database...');
	const dbContent = readFileSync(SOURCE_DB_PATH, 'utf-8');

	// Validate JSON structure and parse
	console.log('[INIT] Validating JSON structure...');
	const dbData = JSON.parse(dbContent);
	if (!dbData || typeof dbData !== 'object') {
		throw new Error('Invalid database structure: must be an object');
	}

	console.log('[INIT] Database structure validated successfully');
	console.log('[INIT] Top-level keys:', Object.keys(dbData).join(', '));
	console.log('[INIT] Pages:', dbData.pages?.length || 0);
	console.log('[INIT] Team members:', dbData.team?.length || 0);
	console.log('[INIT] Services:', dbData.services?.length || 0);
	console.log('[INIT] Icons:', dbData.icons?.length || 0);
	console.log('[INIT] Settings keys:', Object.keys(dbData.settings || {}).length);
	console.log('[INIT] Total database size:', JSON.stringify(dbData).length, 'bytes');

	// Check for force flag
	const force = env.FORCE_OVERWRITE === 'true' || env.FORCE === 'true';
	
	// Prepare API request - send parsed JSON object (not raw string)
	// This ensures proper JSON serialization and all data is included
	const apiUrl = force 
		? `${PRODUCTION_URL}/api/init-database?force=true`
		: `${PRODUCTION_URL}/api/init-database`;
	
	if (force) {
		console.log('[INIT] ⚠️  FORCE mode: Will overwrite existing database if it exists');
	}
	
	console.log('[INIT] Calling init-database API endpoint...');
	console.log('[INIT] URL:', apiUrl);
	console.log('[INIT] Sending database with', Object.keys(dbData).length, 'top-level keys');

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${ADMIN_PASSWORD}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(dbData) // Send parsed JSON object, not raw file string
	});

	const responseData = await response.json();

	if (!response.ok) {
		if (response.status === 400 && responseData.exists) {
			console.log('[INIT] ℹ️  Database already exists on production');
			console.log('[INIT] Path:', responseData.path);
			console.log('[INIT] This is expected if database was already initialized');
			return;
		}
		throw new Error(`API request failed: ${response.status} - ${responseData.error || JSON.stringify(responseData)}`);
	}

	console.log('[INIT] ✅ Database initialized successfully on production!');
	console.log('[INIT] Message:', responseData.message);
	console.log('[INIT] Path:', responseData.path);
} catch (error) {
	console.error('[INIT] ❌ Failed to initialize production database:', error.message);
	if (error.code === 'ENOENT') {
		console.error('[INIT] Make sure the source database file exists at:', SOURCE_DB_PATH);
		console.error('[INIT] Prepare the file locally first: cp data/database.json data/database-restore.json');
	} else if (error.message.includes('fetch')) {
		console.error('[INIT] Make sure the production URL is correct and the site is accessible');
		console.error('[INIT] Set PRODUCTION_URL environment variable if needed');
	} else if (error.message.includes('ADMIN_PASSWORD')) {
		console.error('[INIT] Set the ADMIN_PASSWORD environment variable:');
		console.error('[INIT]   export ADMIN_PASSWORD=your-password');
		console.error('[INIT]   node scripts/init-production-db.js');
	}
	process.exit(1);
}
})();
