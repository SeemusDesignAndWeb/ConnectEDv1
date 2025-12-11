#!/usr/bin/env node

/**
 * check-production-db.js
 * 
 * Diagnostic script to check production database status
 * 
 * Usage:
 *   node scripts/check-production-db.js
 * 
 * Environment Variables:
 *   - PRODUCTION_URL: The production URL (default: from RAILWAY_PUBLIC_DOMAIN)
 *   - ADMIN_PASSWORD: The admin password for authentication
 */

import { env } from 'process';

const PRODUCTION_URL = env.PRODUCTION_URL || env.RAILWAY_PUBLIC_DOMAIN || 'https://your-site.railway.app';
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

console.log('[CHECK] Production Database Diagnostic Tool');
console.log('[CHECK] =================================');
console.log('[CHECK] Production URL:', PRODUCTION_URL);
console.log('');

(async () => {
	try {
		// Check 1: Try to get database status via API
		console.log('[CHECK] 1. Checking database status via API...');
		const statusUrl = `${PRODUCTION_URL}/api/init-database`;
		
		let statusResponse;
		try {
			statusResponse = await fetch(statusUrl, {
				method: 'GET',
				headers: ADMIN_PASSWORD ? {
					'Authorization': `Bearer ${ADMIN_PASSWORD}`
				} : {}
			});
		} catch (error) {
			console.error('[CHECK] ❌ Cannot reach production URL:', error.message);
			console.error('[CHECK]    Check PRODUCTION_URL environment variable');
			process.exit(1);
		}

		if (statusResponse.ok) {
			const statusData = await statusResponse.json();
			console.log('[CHECK] ✅ API endpoint accessible');
			console.log('[CHECK]    Database path:', statusData.databasePath || 'unknown');
			console.log('[CHECK]    Database exists:', statusData.exists ? '✅ YES' : '❌ NO');
			
			if (statusData.exists) {
				console.log('[CHECK]    Database size:', statusData.size || 'unknown', 'bytes');
			} else {
				console.log('[CHECK] ⚠️  Database does not exist - needs initialization');
			}
		} else {
			console.log('[CHECK] ⚠️  API returned status:', statusResponse.status);
			if (statusResponse.status === 401) {
				console.log('[CHECK]    Authentication required - set ADMIN_PASSWORD');
			}
		}

		console.log('');

		// Check 2: Try to read a page to see if database is working
		console.log('[CHECK] 2. Testing database read via pages API...');
		const pagesUrl = `${PRODUCTION_URL}/api/pages/home`;
		
		try {
			const pagesResponse = await fetch(pagesUrl);
			if (pagesResponse.ok) {
				const pagesData = await pagesResponse.json();
				console.log('[CHECK] ✅ Pages API working');
				if (pagesData.sections) {
					console.log('[CHECK]    Home page has sections:', Object.keys(pagesData.sections).length);
					if (pagesData.sections.hero) {
						console.log('[CHECK]    Hero title:', pagesData.sections.hero.title || 'missing');
					}
				} else {
					console.log('[CHECK] ⚠️  Home page has no sections - database might be empty');
				}
			} else {
				console.log('[CHECK] ❌ Pages API returned status:', pagesResponse.status);
			}
		} catch (error) {
			console.log('[CHECK] ❌ Error reading pages:', error.message);
		}

		console.log('');

		// Check 3: Check settings endpoint
		console.log('[CHECK] 3. Testing settings API...');
		const settingsUrl = `${PRODUCTION_URL}/api/settings`;
		
		try {
			const settingsResponse = await fetch(settingsUrl);
			if (settingsResponse.ok) {
				const settingsData = await settingsResponse.json();
				console.log('[CHECK] ✅ Settings API working');
				if (settingsData.settings?.footer) {
					console.log('[CHECK]    Footer settings exist');
				} else {
					console.log('[CHECK] ⚠️  Footer settings missing');
				}
			} else {
				console.log('[CHECK] ❌ Settings API returned status:', settingsResponse.status);
			}
		} catch (error) {
			console.log('[CHECK] ❌ Error reading settings:', error.message);
		}

		console.log('');
		console.log('[CHECK] =================================');
		console.log('[CHECK] Diagnostic complete');
		console.log('');
		console.log('[CHECK] Next steps:');
		console.log('[CHECK] 1. If database does not exist, run:');
		console.log('[CHECK]    ADMIN_PASSWORD=your-password node scripts/init-production-db.js');
		console.log('[CHECK] 2. Check Railway dashboard for:');
		console.log('[CHECK]    - Volume attached to service');
		console.log('[CHECK]    - DATABASE_PATH=/data/database.json environment variable');
		console.log('[CHECK]    - NODE_ENV=production environment variable');

	} catch (error) {
		console.error('[CHECK] ❌ Diagnostic failed:', error.message);
		process.exit(1);
	}
})();
