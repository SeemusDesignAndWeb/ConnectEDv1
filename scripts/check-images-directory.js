#!/usr/bin/env node

/**
 * check-images-directory.js
 * 
 * Checks if the images directory exists on the production volume
 * 
 * Usage:
 *   node scripts/check-images-directory.js
 * 
 * Environment Variables:
 *   - PRODUCTION_URL: The production URL
 *   - ADMIN_PASSWORD: The admin password
 */

import { env } from 'process';

const PRODUCTION_URL = env.PRODUCTION_URL || env.RAILWAY_PUBLIC_DOMAIN || 'https://sveltekit-production-a5dd.up.railway.app';
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

console.log('[CHECK] Checking images directory on production...');
console.log('[CHECK] Production URL:', PRODUCTION_URL);
console.log('');

(async () => {
	try {
		if (!ADMIN_PASSWORD) {
			throw new Error('ADMIN_PASSWORD environment variable not set');
		}

		// Step 1: Login to get session cookie
		console.log('[CHECK] Step 1: Logging in...');
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
		console.log('[CHECK] ✅ Login successful');
		console.log('');

		// Step 2: Check images API - it will tell us the storage path and list images
		console.log('[CHECK] Step 2: Checking images directory via API...');
		const imagesResponse = await fetch(`${PRODUCTION_URL}/api/admin/images`, {
			headers: {
				'Cookie': sessionCookie
			}
		});

		if (!imagesResponse.ok) {
			const errorData = await imagesResponse.json();
			throw new Error(`Failed to check images: ${errorData.error || imagesResponse.statusText}`);
		}

		const imagesData = await imagesResponse.json();
		
		console.log('[CHECK] Images API Response:');
		console.log('[CHECK]   Storage Path:', imagesData.storagePath || 'Not provided');
		console.log('[CHECK]   Public Base:', imagesData.publicBase || 'Not provided');
		console.log('[CHECK]   Number of images:', imagesData.images?.length || 0);
		
		if (imagesData.images && imagesData.images.length > 0) {
			console.log('[CHECK]   Images found:');
			imagesData.images.forEach(img => {
				console.log(`[CHECK]     - ${img.name} (${img.url})`);
			});
		} else {
			console.log('[CHECK]   ⚠️  No images found in directory');
		}
		
		console.log('');
		
		// Analysis
		if (imagesData.storagePath) {
			console.log('[CHECK] Analysis:');
			if (imagesData.storagePath.startsWith('/data') || imagesData.storagePath.startsWith('/app/data')) {
				console.log('[CHECK]   ✅ Images directory is on the volume');
				console.log(`[CHECK]   Path: ${imagesData.storagePath}`);
			} else {
				console.log('[CHECK]   ⚠️  Images directory may not be on the volume');
				console.log(`[CHECK]   Path: ${imagesData.storagePath}`);
			}
			
			if (imagesData.images && imagesData.images.length === 0) {
				console.log('[CHECK]   ⚠️  Directory exists but is empty');
				console.log('[CHECK]   Solution: Upload images using the admin interface or sync script');
			}
		} else {
			console.log('[CHECK]   ⚠️  Could not determine storage path');
		}

	} catch (error) {
		console.error('[CHECK] ❌ Failed:', error.message);
		process.exit(1);
	}
})();
