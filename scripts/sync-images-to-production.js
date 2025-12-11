#!/usr/bin/env node

/**
 * sync-images-to-production.js
 * 
 * Copies local images directory to the Railway volume
 * 
 * Usage:
 *   node scripts/sync-images-to-production.js
 * 
 * Requirements:
 *   - Railway CLI installed and authenticated (railway login and railway link)
 *   - Local images directory at ./data/images
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

const LOCAL_IMAGES_PATH = join(process.cwd(), './data/images');
// Try /data/images first, fallback to /app/data/images if it doesn't exist
const REMOTE_IMAGES_PATH_OPTIONS = ['/data/images', '/app/data/images'];
// Railway service name (hardcoded)
const RAILWAY_SERVICE = 'Website';

console.log('[SYNC-IMAGES] Starting images sync to Railway...');
console.log('[SYNC-IMAGES] Local path:', LOCAL_IMAGES_PATH);
console.log('[SYNC-IMAGES] Remote path:', REMOTE_IMAGES_PATH);

(async () => {
try {
	// Check if local images directory exists
	const { access } = await import('fs/promises');
	try {
		await access(LOCAL_IMAGES_PATH);
	} catch {
		throw new Error(`Local images directory not found at ${LOCAL_IMAGES_PATH}`);
	}

	// List all image files
	console.log('[SYNC-IMAGES] Reading local images...');
	const files = await readdir(LOCAL_IMAGES_PATH, { withFileTypes: true });
	const imageFiles = files.filter(f => f.isFile());
	
	if (imageFiles.length === 0) {
		console.log('[SYNC-IMAGES] No images found in local directory');
		return;
	}

	console.log('[SYNC-IMAGES] Found', imageFiles.length, 'image files');
	
	// Detect which path works by trying to create the directory
	console.log('[SYNC-IMAGES] Detecting available path...');
	let REMOTE_IMAGES_PATH = null;
	
	for (const pathOption of REMOTE_IMAGES_PATH_OPTIONS) {
		try {
			console.log('[SYNC-IMAGES] Trying path:', pathOption);
			const mkdirCommand = `railway run --service ${RAILWAY_SERVICE} sh -c "mkdir -p ${pathOption}"`;
			execSync(mkdirCommand, { stdio: 'pipe', encoding: 'utf-8' });
			REMOTE_IMAGES_PATH = pathOption;
			console.log('[SYNC-IMAGES] ✅ Using path:', REMOTE_IMAGES_PATH);
			break;
		} catch (error) {
			console.log(`[SYNC-IMAGES] Path ${pathOption} not available, trying next...`);
			continue;
		}
	}
	
	if (!REMOTE_IMAGES_PATH) {
		throw new Error(`None of the image paths are available: ${REMOTE_IMAGES_PATH_OPTIONS.join(', ')}`);
	}

	// Copy each image file
	let successCount = 0;
	let errorCount = 0;

	for (const file of imageFiles) {
		const fileName = file.name;
		const localFilePath = join(LOCAL_IMAGES_PATH, fileName);
		const remoteFilePath = `${REMOTE_IMAGES_PATH}/${fileName}`;

		try {
			console.log(`[SYNC-IMAGES] Copying ${fileName}...`);
			
			// Read file and encode to base64 (not logged to keep console clean)
			const fileBuffer = await readFile(localFilePath);
			const base64Content = fileBuffer.toString('base64');
			
			// Write to Railway volume using base64
			const command = `railway run --service ${RAILWAY_SERVICE} sh -c "echo '${base64Content}' | base64 -d > ${remoteFilePath}"`;
			execSync(command, { stdio: 'pipe' });
			
			successCount++;
			console.log(`[SYNC-IMAGES] ✅ ${fileName} copied successfully`);
		} catch (error) {
			errorCount++;
			console.error(`[SYNC-IMAGES] ❌ Failed to copy ${fileName}:`, error.message);
		}
	}

	console.log('[SYNC-IMAGES] Sync complete!');
	console.log('[SYNC-IMAGES] Successfully copied:', successCount, 'files');
	if (errorCount > 0) {
		console.log('[SYNC-IMAGES] Failed:', errorCount, 'files');
	}
} catch (error) {
	console.error('[SYNC-IMAGES] ❌ Failed to sync images:', error.message);
	if (error.message.includes('railway')) {
		console.error('[SYNC-IMAGES] Make sure Railway CLI is installed and authenticated:');
		console.error('[SYNC-IMAGES]   1. Install: npm install -g @railway/cli');
		console.error('[SYNC-IMAGES]   2. Login: railway login');
		console.error('[SYNC-IMAGES]   3. Link: railway link');
	}
	process.exit(1);
}
})();
