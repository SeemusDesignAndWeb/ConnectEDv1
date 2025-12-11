#!/usr/bin/env node

/**
 * sync-database-to-production.js
 * 
 * Copies the local database file directly to the Railway volume
 * 
 * Usage:
 *   node scripts/sync-database-to-production.js
 * 
 * Requirements:
 *   - Railway CLI installed and authenticated (railway login and railway link)
 *   - Local database file at ./data/database.json
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';

const LOCAL_DB_PATH = join(process.cwd(), './data/database.json');
// Try /data first, fallback to /app/data if it doesn't exist
const REMOTE_DB_PATH_OPTIONS = ['/data/database.json', '/app/data/database.json'];
// Railway service name (hardcoded)
const RAILWAY_SERVICE = 'Website';

console.log('[SYNC] Starting database sync to Railway...');
console.log('[SYNC] Local path:', LOCAL_DB_PATH);
console.log('[SYNC] Will try remote paths:', REMOTE_DB_PATH_OPTIONS.join(', '));

// Check if Railway CLI is available
try {
	console.log('[SYNC] Checking Railway CLI...');
	execSync('railway --version', { stdio: 'pipe' });
	console.log('[SYNC] Railway CLI found');
} catch (cliError) {
	console.error('[SYNC] ❌ Railway CLI not found or not accessible');
	console.error('[SYNC] Please install Railway CLI:');
	console.error('[SYNC]   npm install -g @railway/cli');
	console.error('[SYNC] Then authenticate:');
	console.error('[SYNC]   railway login');
	console.error('[SYNC]   railway link');
	process.exit(1);
}

try {
	// Read local database
	console.log('[SYNC] Reading local database...');
	const dbContent = readFileSync(LOCAL_DB_PATH, 'utf-8');

	// Validate JSON structure
	console.log('[SYNC] Validating JSON structure...');
	const dbData = JSON.parse(dbContent);
	if (!dbData || typeof dbData !== 'object') {
		throw new Error('Invalid database structure: must be an object');
	}

	console.log('[SYNC] Database structure validated successfully');
	console.log('[SYNC] Pages:', dbData.pages?.length || 0);
	console.log('[SYNC] Team members:', dbData.team?.length || 0);
	console.log('[SYNC] Services:', dbData.services?.length || 0);

	// Check file size
	const fileSize = dbContent.length;
	console.log('[SYNC] Database file size:', fileSize, 'bytes');

	// Encode to base64 for Railway CLI (not logged to keep console clean)
	const base64Content = Buffer.from(dbContent).toString('base64');

	// Use Railway CLI to write to volume
	console.log('[SYNC] Writing to Railway volume...');
	console.log('[SYNC] Service:', RAILWAY_SERVICE);
	
	// Try each path option until one works
	let success = false;
	let usedPath = null;
	
		for (const REMOTE_DB_PATH of REMOTE_DB_PATH_OPTIONS) {
		try {
			console.log('[SYNC] Trying path:', REMOTE_DB_PATH);
			
			// Check if directory exists and is writable
			const dirPath = dirname(REMOTE_DB_PATH);
			console.log('[SYNC] Checking directory:', dirPath);
			const checkWritableCommand = `railway run --service ${RAILWAY_SERVICE} sh -c "test -w ${dirPath} && echo 'writable' || (test -d ${dirPath} && echo 'readonly' || echo 'missing')"`;
			let dirStatus = 'unknown';
			try {
				const checkResult = execSync(checkWritableCommand, { 
					stdio: 'pipe', 
					encoding: 'utf-8'
				}).trim();
				dirStatus = checkResult;
				console.log(`[SYNC] Directory ${dirPath} status:`, dirStatus);
			} catch (checkError) {
				console.log(`[SYNC] Could not check directory ${dirPath}, will try to write anyway`);
				dirStatus = 'unknown';
			}
			
			// If directory is missing, try to create it (but don't fail if it's read-only)
			if (dirStatus === 'missing') {
				console.log('[SYNC] Attempting to create directory:', dirPath);
				const mkdirCommand = `railway run --service ${RAILWAY_SERVICE} sh -c "mkdir -p ${dirPath} 2>/dev/null || true"`;
				try {
					execSync(mkdirCommand, { 
						stdio: 'pipe', 
						encoding: 'utf-8'
					});
				} catch (mkdirError) {
					// Ignore mkdir errors - directory might already exist or be read-only
					console.log(`[SYNC] Directory creation attempt completed (may have failed if read-only)`);
				}
			}
			
			// Try to write the database file directly
			// Use a test write first to verify the path is writable
			console.log('[SYNC] Attempting to write database file...');
			const command = `railway run --service ${RAILWAY_SERVICE} sh -c "echo '${base64Content}' | base64 -d > ${REMOTE_DB_PATH}"`;
			
			try {
				execSync(command, { 
					stdio: 'inherit', 
					maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large files
					encoding: 'utf-8'
				});
			} catch (writeError) {
				const errorMsg = writeError.message || '';
				const stderr = writeError.stderr?.toString() || '';
				
				// Check for specific error patterns
				if (errorMsg.includes('No such file or directory') || stderr.includes('No such file or directory')) {
					console.error(`[SYNC] Directory does not exist or is not accessible: ${dirPath}`);
				} else if (errorMsg.includes('Read-only') || stderr.includes('Read-only')) {
					console.error(`[SYNC] Directory is read-only: ${dirPath}`);
				} else {
					console.error(`[SYNC] Write failed:`, errorMsg);
					if (writeError.stdout) {
						console.error('[SYNC] stdout:', writeError.stdout.toString());
					}
					if (stderr) {
						console.error('[SYNC] stderr:', stderr);
					}
				}
				throw writeError;
			}
			
			success = true;
			usedPath = REMOTE_DB_PATH;
			console.log('[SYNC] ✅ Successfully wrote to:', REMOTE_DB_PATH);
			break;
		} catch (execError) {
			// If this path failed, try the next one
			console.log(`[SYNC] Path ${REMOTE_DB_PATH} failed:`, execError.message);
			console.log('[SYNC] Trying next option...');
			continue;
		}
	}
	
	if (!success) {
		console.error('[SYNC] ❌ Failed to write to all path options');
		console.error('[SYNC] Tried paths:', REMOTE_DB_PATH_OPTIONS.join(', '));
		throw new Error('Failed to write database to any available path');
	}

	console.log('[SYNC] ✅ Database synced successfully to Railway volume!');
	console.log('[SYNC] Remote path:', usedPath);
} catch (error) {
	console.error('');
	console.error('[SYNC] ❌ Failed to sync database');
	console.error('[SYNC] Error:', error.message);
	console.error('');
	
	if (error.code === 'ENOENT') {
		console.error('[SYNC] Make sure the local database file exists at:', LOCAL_DB_PATH);
	} else if (error.message.includes('railway') || error.message.includes('Railway CLI')) {
		console.error('[SYNC] Railway CLI issue detected. Please check:');
		console.error('[SYNC]   1. Is Railway CLI installed?');
		console.error('[SYNC]      Run: npm install -g @railway/cli');
		console.error('[SYNC]   2. Are you logged in?');
		console.error('[SYNC]      Run: railway login');
		console.error('[SYNC]   3. Is the project linked?');
		console.error('[SYNC]      Run: railway link');
		console.error('[SYNC]   4. Is the service name correct?');
		console.error('[SYNC]      Check with: railway status');
		console.error('[SYNC]      Or set RAILWAY_SERVICE=<service-name> environment variable');
	} else if (error.message.includes('command not found')) {
		console.error('[SYNC] Railway CLI not found. Install it with:');
		console.error('[SYNC]   npm install -g @railway/cli');
	} else {
		console.error('[SYNC] Full error details:');
		console.error(error);
	}
	
	process.exit(1);
}
