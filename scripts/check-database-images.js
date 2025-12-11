#!/usr/bin/env node

/**
 * check-database-images.js
 * 
 * Checks if the production database contains image references
 * 
 * Usage:
 *   node scripts/check-database-images.js
 * 
 * Environment Variables:
 *   - PRODUCTION_URL: The production URL
 *   - ADMIN_PASSWORD: The admin password (optional, for direct database access)
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { env } from 'process';

const LOCAL_DB_PATH = join(process.cwd(), 'data/database.json');
const PRODUCTION_URL = env.PRODUCTION_URL || env.RAILWAY_PUBLIC_DOMAIN || 'https://sveltekit-production-a5dd.up.railway.app';
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

console.log('[CHECK] Checking database images...');
console.log('[CHECK] Production URL:', PRODUCTION_URL);
console.log('');

/**
 * Recursively find all image references in an object
 */
function findImages(obj, path = '', images = []) {
	if (typeof obj !== 'object' || obj === null) {
		return images;
	}

	if (Array.isArray(obj)) {
		obj.forEach((item, index) => {
			findImages(item, `${path}[${index}]`, images);
		});
	} else {
		Object.keys(obj).forEach(key => {
			const value = obj[key];
			const currentPath = path ? `${path}.${key}` : key;
			
			// Check if this is an image field
			if (key === 'image' || key === 'images') {
				if (typeof value === 'string' && value.trim()) {
					images.push({
						path: currentPath,
						value: value,
						type: key
					});
				} else if (Array.isArray(value)) {
					value.forEach((img, idx) => {
						if (typeof img === 'string' && img.trim()) {
							images.push({
								path: `${currentPath}[${idx}]`,
								value: img,
								type: key
							});
						}
					});
				}
			}
			
			// Recursively search nested objects
			if (typeof value === 'object' && value !== null) {
				findImages(value, currentPath, images);
			}
		});
	}
	
	return images;
}

(async () => {
	try {
		// Read local database
		console.log('[CHECK] Reading local database...');
		const localDbContent = readFileSync(LOCAL_DB_PATH, 'utf-8');
		const localDb = JSON.parse(localDbContent);
		const localImages = findImages(localDb);
		
		console.log(`[CHECK] Local database contains ${localImages.length} image reference(s):`);
		localImages.forEach(img => {
			console.log(`[CHECK]   ${img.path}: ${img.value}`);
		});
		console.log('');

		// Try to get production database via API
		console.log('[CHECK] Checking production database...');
		
		// Method 1: Try to get via admin API (if we have password)
		if (ADMIN_PASSWORD) {
			try {
				// Login first to get session
				const loginResponse = await fetch(`${PRODUCTION_URL}/api/admin/login`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ password: ADMIN_PASSWORD })
				});

				if (loginResponse.ok) {
					// Get cookies from login
					const cookies = loginResponse.headers.get('set-cookie');
					const sessionCookie = cookies?.split(';')[0] || '';
					
					// Get pages from admin API
					const pagesResponse = await fetch(`${PRODUCTION_URL}/api/admin/pages`, {
						headers: {
							'Cookie': sessionCookie
						}
					});

					if (pagesResponse.ok) {
						const pagesData = await pagesResponse.json();
						const productionImages = findImages(pagesData);
						
						console.log(`[CHECK] Production database contains ${productionImages.length} image reference(s):`);
						if (productionImages.length > 0) {
							productionImages.forEach(img => {
								console.log(`[CHECK]   ${img.path}: ${img.value}`);
							});
						} else {
							console.log('[CHECK]   ⚠️  No images found in production database!');
						}
						console.log('');

						// Compare
						console.log('[CHECK] Comparison:');
						console.log(`[CHECK]   Local images: ${localImages.length}`);
						console.log(`[CHECK]   Production images: ${productionImages.length}`);
						
						if (localImages.length === productionImages.length) {
							console.log('[CHECK]   ✅ Image count matches!');
							
							// Check if all local images exist in production
							const localImagePaths = localImages.map(img => img.value).sort();
							const productionImagePaths = productionImages.map(img => img.value).sort();
							
							const missing = localImagePaths.filter(path => !productionImagePaths.includes(path));
							if (missing.length === 0) {
								console.log('[CHECK]   ✅ All local images are present in production!');
							} else {
								console.log('[CHECK]   ⚠️  Missing images in production:');
								missing.forEach(path => console.log(`[CHECK]     - ${path}`));
							}
						} else {
							console.log('[CHECK]   ⚠️  Image count mismatch!');
							console.log('[CHECK]   Production database may be missing image references.');
						}
						
						return;
					}
				}
			} catch (apiError) {
				console.log('[CHECK]   Could not access via admin API:', apiError.message);
			}
		}

		// Method 2: Check via public pages API (limited, but doesn't require auth)
		console.log('[CHECK] Checking via public pages API...');
		const testPages = ['home', 'students', 'universities'];
		let foundImages = [];
		
		for (const pageId of testPages) {
			try {
				const pageResponse = await fetch(`${PRODUCTION_URL}/api/pages/${pageId}`);
				if (pageResponse.ok) {
					const pageData = await pageResponse.json();
					const pageImages = findImages(pageData);
					foundImages.push(...pageImages.map(img => ({ ...img, page: pageId })));
				}
			} catch (error) {
				console.log(`[CHECK]   Could not fetch page ${pageId}:`, error.message);
			}
		}

		if (foundImages.length > 0) {
			console.log(`[CHECK] Found ${foundImages.length} image reference(s) in production pages:`);
			foundImages.forEach(img => {
				console.log(`[CHECK]   [${img.page}] ${img.path}: ${img.value}`);
			});
		} else {
			console.log('[CHECK]   ⚠️  No images found in production pages!');
			console.log('[CHECK]   This suggests the database may not have image references.');
		}

		console.log('');
		console.log('[CHECK] Summary:');
		console.log(`[CHECK]   Local database: ${localImages.length} image reference(s)`);
		console.log(`[CHECK]   Production (via API): ${foundImages.length} image reference(s)`);
		
		if (foundImages.length < localImages.length) {
			console.log('');
			console.log('[CHECK] ⚠️  Production database appears to be missing image references!');
			console.log('[CHECK]   Solution: Run the force overwrite after deploying updated code:');
			console.log('[CHECK]     FORCE_OVERWRITE=true node scripts/init-production-db.js');
		}

	} catch (error) {
		console.error('[CHECK] ❌ Failed:', error.message);
		process.exit(1);
	}
})();
