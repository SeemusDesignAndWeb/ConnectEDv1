#!/usr/bin/env node

/**
 * sync-images-from-database.js
 * 
 * Extracts image references from the database and ensures those specific images
 * are copied to the Railway volume at /data/images
 * 
 * Usage:
 *   node scripts/sync-images-from-database.js
 * 
 * Requirements:
 *   - Railway CLI installed and authenticated
 *   - Local database at ./data/database.json (or ./data/database-restore.json)
 *   - Local images directory at ./data/images
 */

import { readFileSync, readdir, readFile, existsSync } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

const LOCAL_DB_PATH = join(process.cwd(), './data/database.json');
const LOCAL_DB_RESTORE_PATH = join(process.cwd(), './data/database-restore.json');
// Railway service name (hardcoded)
const RAILWAY_SERVICE = 'Website';
const LOCAL_IMAGES_PATH = join(process.cwd(), './data/images');
// Try /data/images first, fallback to /app/data/images if it doesn't exist
const REMOTE_IMAGES_PATH_OPTIONS = ['/data/images', '/app/data/images'];

/**
 * Recursively extract all image paths from an object
 */
function extractImagePaths(obj, paths = new Set()) {
	if (!obj || typeof obj !== 'object') {
		return paths;
	}

	for (const [key, value] of Object.entries(obj)) {
		if (key === 'image' || key === 'url' || key === 'file') {
			if (typeof value === 'string' && value.includes('/images/')) {
				// Extract filename from path like "/images/researcher.jpg"
				const filename = value.split('/images/')[1];
				if (filename) {
					paths.add(filename);
				}
			} else if (typeof value === 'string' && (value.endsWith('.jpg') || value.endsWith('.jpeg') || value.endsWith('.png') || value.endsWith('.svg') || value.endsWith('.gif') || value.endsWith('.webp'))) {
				// Direct filename reference
				paths.add(value);
			}
		} else if (Array.isArray(value)) {
			value.forEach(item => extractImagePaths(item, paths));
		} else if (typeof value === 'object') {
			extractImagePaths(value, paths);
		}
	}

	return paths;
}

console.log('[SYNC-IMAGES-DB] Starting image sync based on database references...');
console.log('[SYNC-IMAGES-DB] Local images path:', LOCAL_IMAGES_PATH);
console.log('[SYNC-IMAGES-DB] Will try remote paths:', REMOTE_IMAGES_PATH_OPTIONS.join(', '));

(async () => {
try {
	// Find database file
	let dbPath = LOCAL_DB_PATH;
	if (!existsSync(dbPath) && existsSync(LOCAL_DB_RESTORE_PATH)) {
		dbPath = LOCAL_DB_RESTORE_PATH;
		console.log('[SYNC-IMAGES-DB] Using database-restore.json');
	}

	if (!existsSync(dbPath)) {
		throw new Error(`Database file not found. Expected at ${LOCAL_DB_PATH} or ${LOCAL_DB_RESTORE_PATH}`);
	}

	// Read and parse database
	console.log('[SYNC-IMAGES-DB] Reading database...');
	const dbContent = readFileSync(dbPath, 'utf-8');
	const dbData = JSON.parse(dbContent);

	// Extract all image references
	console.log('[SYNC-IMAGES-DB] Extracting image references from database...');
	const imagePaths = extractImagePaths(dbData);
	
	console.log('[SYNC-IMAGES-DB] Found', imagePaths.size, 'unique image references:');
	imagePaths.forEach(img => console.log('[SYNC-IMAGES-DB]   -', img));

	if (imagePaths.size === 0) {
		console.log('[SYNC-IMAGES-DB] No image references found in database');
		return;
	}

	// Check if local images directory exists
	try {
		await (await import('fs/promises')).access(LOCAL_IMAGES_PATH);
	} catch {
		throw new Error(`Local images directory not found at ${LOCAL_IMAGES_PATH}`);
	}

	// Verify all referenced images exist locally
	console.log('[SYNC-IMAGES-DB] Verifying local images exist...');
	const missingImages = [];
	for (const imageName of imagePaths) {
		const localImagePath = join(LOCAL_IMAGES_PATH, imageName);
		if (!existsSync(localImagePath)) {
			missingImages.push(imageName);
			console.warn(`[SYNC-IMAGES-DB] ⚠️  Warning: Referenced image not found locally: ${imageName}`);
		}
	}

	if (missingImages.length > 0) {
		console.warn(`[SYNC-IMAGES-DB] ⚠️  ${missingImages.length} referenced images are missing locally`);
		console.warn('[SYNC-IMAGES-DB] These images will be skipped during sync');
	}

	// Detect which path works by trying to create the directory
	console.log('[SYNC-IMAGES-DB] Detecting available path...');
	let REMOTE_IMAGES_PATH = null;
	
	for (const pathOption of REMOTE_IMAGES_PATH_OPTIONS) {
		try {
			console.log('[SYNC-IMAGES-DB] Trying path:', pathOption);
			const mkdirCommand = `railway run --service ${RAILWAY_SERVICE} sh -c "mkdir -p ${pathOption}"`;
			execSync(mkdirCommand, { stdio: 'pipe', encoding: 'utf-8' });
			REMOTE_IMAGES_PATH = pathOption;
			console.log('[SYNC-IMAGES-DB] ✅ Using path:', REMOTE_IMAGES_PATH);
			break;
		} catch (error) {
			console.log(`[SYNC-IMAGES-DB] Path ${pathOption} not available, trying next...`);
			continue;
		}
	}
	
	if (!REMOTE_IMAGES_PATH) {
		throw new Error(`None of the image paths are available: ${REMOTE_IMAGES_PATH_OPTIONS.join(', ')}`);
	}

	// Copy each referenced image
	let successCount = 0;
	let errorCount = 0;
	let skippedCount = 0;

	for (const imageName of imagePaths) {
		const localImagePath = join(LOCAL_IMAGES_PATH, imageName);
		
		if (!existsSync(localImagePath)) {
			skippedCount++;
			continue;
		}

		const remoteImagePath = `${REMOTE_IMAGES_PATH}/${imageName}`;

		try {
			console.log(`[SYNC-IMAGES-DB] Copying ${imageName}...`);
			
			// Read file and encode to base64 (not logged to keep console clean)
			const fileBuffer = await readFile(localImagePath);
			const base64Content = fileBuffer.toString('base64');
			
			// Write to Railway volume using base64
			const command = `railway run --service ${RAILWAY_SERVICE} sh -c "echo '${base64Content}' | base64 -d > ${remoteImagePath}"`;
			execSync(command, { stdio: 'pipe' });
			
			successCount++;
			console.log(`[SYNC-IMAGES-DB] ✅ ${imageName} copied successfully`);
		} catch (error) {
			errorCount++;
			console.error(`[SYNC-IMAGES-DB] ❌ Failed to copy ${imageName}:`, error.message);
		}
	}

	console.log('');
	console.log('[SYNC-IMAGES-DB] ========================================');
	console.log('[SYNC-IMAGES-DB] Sync Summary:');
	console.log('[SYNC-IMAGES-DB]   Successfully copied:', successCount, 'files');
	if (skippedCount > 0) {
		console.log('[SYNC-IMAGES-DB]   Skipped (missing locally):', skippedCount, 'files');
	}
	if (errorCount > 0) {
		console.log('[SYNC-IMAGES-DB]   Failed:', errorCount, 'files');
	}
	console.log('[SYNC-IMAGES-DB] ========================================');

	if (errorCount > 0) {
		process.exit(1);
	}
} catch (error) {
	console.error('[SYNC-IMAGES-DB] ❌ Failed to sync images:', error.message);
	if (error.message.includes('railway')) {
		console.error('[SYNC-IMAGES-DB] Make sure Railway CLI is installed and authenticated:');
		console.error('[SYNC-IMAGES-DB]   1. Install: npm install -g @railway/cli');
		console.error('[SYNC-IMAGES-DB]   2. Login: railway login');
		console.error('[SYNC-IMAGES-DB]   3. Link: railway link');
	}
	process.exit(1);
}
})();
