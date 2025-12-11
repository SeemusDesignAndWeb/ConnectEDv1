#!/usr/bin/env node

/**
 * test-database.js
 * 
 * Tests if the database exists and is readable on production
 * 
 * Usage:
 *   node scripts/test-database.js
 * 
 * Environment Variables:
 *   - PRODUCTION_URL: The production URL (default: https://sveltekit-production-a5dd.up.railway.app)
 *   - ADMIN_PASSWORD: The admin password for authentication (optional, for status check)
 */

import { env } from 'process';

const PRODUCTION_URL = env.PRODUCTION_URL || env.RAILWAY_PUBLIC_DOMAIN || 'https://sveltekit-production-a5dd.up.railway.app';
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

console.log('[TEST] Testing production database...');
console.log('[TEST] Production URL:', PRODUCTION_URL);
console.log('');

(async () => {
	try {
		// Test 1: Check database status (requires auth)
		if (ADMIN_PASSWORD) {
			console.log('[TEST] 1. Checking database status...');
			try {
				const statusResponse = await fetch(`${PRODUCTION_URL}/api/init-database`, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${ADMIN_PASSWORD}`
					}
				});

				const statusData = await statusResponse.json();
				
				if (statusResponse.ok) {
					console.log('[TEST] ✅ Database status:');
					console.log('[TEST]    Path:', statusData.path);
					console.log('[TEST]    Exists:', statusData.exists ? 'YES' : 'NO');
					console.log('[TEST]    Environment:', statusData.environment);
					console.log('[TEST]    DATABASE_PATH:', statusData.databasePath);
					
					if (!statusData.exists) {
						console.log('[TEST] ⚠️  Database file does not exist!');
						console.log('[TEST]    Run: node scripts/init-production-db.js');
					}
				} else {
					console.log('[TEST] ⚠️  Could not check status:', statusData.error);
				}
			} catch (statusError) {
				console.log('[TEST] ⚠️  Status check failed:', statusError.message);
			}
			console.log('');
		} else {
			console.log('[TEST] 1. Skipping status check (ADMIN_PASSWORD not set)');
			console.log('');
		}

		// Test 2: Try to read a page (public endpoint, no auth needed)
		console.log('[TEST] 2. Testing database read access...');
		console.log('[TEST]    Attempting to read home page...');
		
		const pageResponse = await fetch(`${PRODUCTION_URL}/api/pages/home`);
		
		if (!pageResponse.ok) {
			console.log('[TEST] ❌ Failed to read page:', pageResponse.status, pageResponse.statusText);
			const errorText = await pageResponse.text();
			console.log('[TEST]    Error:', errorText);
			return;
		}

		const pageData = await pageResponse.json();
		
		if (pageData.content === null && pageData.sections === null) {
			console.log('[TEST] ⚠️  Page not found in database');
			console.log('[TEST]    This could mean:');
			console.log('[TEST]    - Database exists but is empty');
			console.log('[TEST]    - Database path is incorrect');
			console.log('[TEST]    - Database file is corrupted');
		} else {
			console.log('[TEST] ✅ Successfully read page data!');
			console.log('[TEST]    Content length:', pageData.content?.length || 0, 'characters');
			console.log('[TEST]    Has sections:', pageData.sections ? 'YES' : 'NO');
			
			if (pageData.sections) {
				const sectionKeys = Object.keys(pageData.sections);
				console.log('[TEST]    Sections:', sectionKeys.join(', '));
			}
		}
		console.log('');

		// Test 3: Try to read multiple pages to verify database structure
		console.log('[TEST] 3. Testing multiple pages...');
		const testPages = ['home', 'about', 'students', 'universities', 'contact'];
		let successCount = 0;
		let foundCount = 0;

		for (const pageId of testPages) {
			try {
				const testResponse = await fetch(`${PRODUCTION_URL}/api/pages/${pageId}`);
				if (testResponse.ok) {
					successCount++;
					const testData = await testResponse.json();
					if (testData.content !== null || testData.sections !== null) {
						foundCount++;
						console.log(`[TEST]    ✅ ${pageId}: Found`);
					} else {
						console.log(`[TEST]    ⚠️  ${pageId}: Not found in database`);
					}
				} else {
					console.log(`[TEST]    ❌ ${pageId}: HTTP ${testResponse.status}`);
				}
			} catch (testError) {
				console.log(`[TEST]    ❌ ${pageId}: ${testError.message}`);
			}
		}

		console.log('');
		console.log('[TEST] Summary:');
		console.log(`[TEST]    API calls successful: ${successCount}/${testPages.length}`);
		console.log(`[TEST]    Pages found in database: ${foundCount}/${testPages.length}`);

		if (foundCount === 0) {
			console.log('');
			console.log('[TEST] ⚠️  No pages found in database!');
			console.log('[TEST]    Possible issues:');
			console.log('[TEST]    1. Database file is empty or has wrong structure');
			console.log('[TEST]    2. DATABASE_PATH environment variable is incorrect');
			console.log('[TEST]    3. Database was initialized but with empty/default data');
			console.log('[TEST]    Solution: Run initialization with your data:');
			console.log('[TEST]       node scripts/init-production-db.js');
		} else if (foundCount < testPages.length) {
			console.log('');
			console.log('[TEST] ⚠️  Some pages are missing from database');
		} else {
			console.log('');
			console.log('[TEST] ✅ All tests passed! Database is working correctly.');
		}

	} catch (error) {
		console.error('[TEST] ❌ Test failed:', error.message);
		if (error.message.includes('fetch')) {
			console.error('[TEST]    Make sure the production URL is correct and the site is accessible');
			console.error('[TEST]    Set PRODUCTION_URL environment variable if needed');
		}
		process.exit(1);
	}
})();
