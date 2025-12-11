#!/usr/bin/env node

/**
 * upload-images-via-api.js
 * 
 * Uploads images to production via the admin API
 * This works because the API runs inside the container where the volume is mounted
 * 
 * Usage:
 *   node scripts/upload-images-via-api.js
 * 
 * Environment Variables:
 *   - PRODUCTION_URL: The production URL
 *   - ADMIN_PASSWORD: The admin password
 */

import { readFileSync } from 'fs';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { env } from 'process';

const LOCAL_IMAGES_PATH = join(process.cwd(), './data/images');
const PRODUCTION_URL = env.PRODUCTION_URL || env.RAILWAY_PUBLIC_DOMAIN || 'https://sveltekit-production-a5dd.up.railway.app';
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

console.log('[UPLOAD-IMAGES] Starting image upload via API...');
console.log('[UPLOAD-IMAGES] Production URL:', PRODUCTION_URL);
console.log('[UPLOAD-IMAGES] Local images path:', LOCAL_IMAGES_PATH);
console.log('');

(async () => {
	try {
		if (!ADMIN_PASSWORD) {
			throw new Error('ADMIN_PASSWORD environment variable not set');
		}

		// Step 1: Login to get session cookie
		console.log('[UPLOAD-IMAGES] Step 1: Logging in...');
		const loginResponse = await fetch(`${PRODUCTION_URL}/api/admin/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ password: ADMIN_PASSWORD })
		});

		if (!loginResponse.ok) {
			const errorData = await loginResponse.json();
			throw new Error(`Login failed: ${errorData.error || loginResponse.statusText}`);
		}

		// Extract session cookie
		const setCookieHeader = loginResponse.headers.get('set-cookie');
		if (!setCookieHeader) {
			throw new Error('No session cookie received from login');
		}

		const sessionCookie = setCookieHeader.split(';')[0];
		console.log('[UPLOAD-IMAGES] ✅ Login successful');
		console.log('');

		// Step 2: Get list of existing images
		console.log('[UPLOAD-IMAGES] Step 2: Checking existing images...');
		const listResponse = await fetch(`${PRODUCTION_URL}/api/admin/images`, {
			headers: {
				'Cookie': sessionCookie
			}
		});

		let existingImages = [];
		if (listResponse.ok) {
			const listData = await listResponse.json();
			existingImages = listData.images || [];
			console.log(`[UPLOAD-IMAGES] Found ${existingImages.length} existing image(s) in production`);
		}
		console.log('');

		// Step 3: Read local images directory
		console.log('[UPLOAD-IMAGES] Step 3: Reading local images...');
		const files = await readdir(LOCAL_IMAGES_PATH);
		const imageFiles = files.filter(f => 
			f.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)
		);

		console.log(`[UPLOAD-IMAGES] Found ${imageFiles.length} image file(s) locally:`);
		imageFiles.forEach(f => console.log(`[UPLOAD-IMAGES]   - ${f}`));
		console.log('');

		// Step 4: Upload each image
		console.log('[UPLOAD-IMAGES] Step 4: Uploading images...');
		let uploadedCount = 0;
		let skippedCount = 0;
		let errorCount = 0;

		for (const filename of imageFiles) {
			// Check if already exists
			const exists = existingImages.some(img => img.name === filename);
			if (exists) {
				console.log(`[UPLOAD-IMAGES] ⏭️  Skipping ${filename} (already exists)`);
				skippedCount++;
				continue;
			}

			try {
				console.log(`[UPLOAD-IMAGES] Uploading ${filename}...`);
				
				// Read file
				const filePath = join(LOCAL_IMAGES_PATH, filename);
				const fileBuffer = readFileSync(filePath);
				
				// Convert to base64
				const base64Data = fileBuffer.toString('base64');
				
				// Determine MIME type from extension
				const ext = filename.split('.').pop()?.toLowerCase();
				const mimeTypes = {
					'jpg': 'image/jpeg',
					'jpeg': 'image/jpeg',
					'png': 'image/png',
					'gif': 'image/gif',
					'svg': 'image/svg+xml',
					'webp': 'image/webp'
				};
				const mimeType = mimeTypes[ext || ''] || 'image/jpeg';

				// Upload as JSON with base64
				const uploadResponse = await fetch(`${PRODUCTION_URL}/api/admin/images`, {
					method: 'POST',
					headers: {
						'Cookie': sessionCookie,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						data: base64Data,
						filename: filename,
						mimeType: mimeType
					})
				});

				if (uploadResponse.ok) {
					const contentType = uploadResponse.headers.get('content-type');
					if (contentType && contentType.includes('application/json')) {
						const uploadData = await uploadResponse.json();
						console.log(`[UPLOAD-IMAGES] ✅ ${filename} uploaded successfully`);
						console.log(`[UPLOAD-IMAGES]    URL: ${uploadData.uploaded || 'N/A'}`);
						uploadedCount++;
					} else {
						const text = await uploadResponse.text();
						console.log(`[UPLOAD-IMAGES] ✅ ${filename} uploaded (response: ${text.substring(0, 100)})`);
						uploadedCount++;
					}
				} else {
					const contentType = uploadResponse.headers.get('content-type');
					let errorMsg = uploadResponse.statusText;
					if (contentType && contentType.includes('application/json')) {
						try {
							const errorData = await uploadResponse.json();
							errorMsg = errorData.error || errorMsg;
						} catch {
							// Not JSON, use status text
						}
					} else {
						const text = await uploadResponse.text();
						errorMsg = text.substring(0, 200) || errorMsg;
					}
					console.error(`[UPLOAD-IMAGES] ❌ Failed to upload ${filename}:`, errorMsg);
					errorCount++;
				}
			} catch (error) {
				console.error(`[UPLOAD-IMAGES] ❌ Error uploading ${filename}:`, error.message);
				errorCount++;
			}
		}

		console.log('');
		console.log('[UPLOAD-IMAGES] ========================================');
		console.log('[UPLOAD-IMAGES] Upload Summary:');
		console.log(`[UPLOAD-IMAGES]   Uploaded: ${uploadedCount} file(s)`);
		console.log(`[UPLOAD-IMAGES]   Skipped (already exists): ${skippedCount} file(s)`);
		console.log(`[UPLOAD-IMAGES]   Failed: ${errorCount} file(s)`);
		console.log('[UPLOAD-IMAGES] ========================================');

		if (errorCount > 0) {
			process.exit(1);
		}

		console.log('');
		console.log('[UPLOAD-IMAGES] ✅ All images uploaded successfully!');
	} catch (error) {
		console.error('[UPLOAD-IMAGES] ❌ Failed:', error.message);
		process.exit(1);
	}
})();
