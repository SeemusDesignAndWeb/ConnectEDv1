import { json } from '@sveltejs/kit';
import { existsSync, unlinkSync } from 'fs';
import { initializeDatabase, initializeDatabaseWithData, getDatabasePath } from '$lib/database.js';

/**
 * POST /api/init-database
 * Initialize the database file with default structure or provided data
 * Protected by admin password authentication
 * 
 * Checks if database already exists - if it does, returns an error without overwriting
 * Only writes if the database file doesn't exist
 * 
 * Accepts optional database content in request body (JSON)
 * If no body provided, initializes with default structure
 */
export async function POST({ request }) {
	const authHeader = request.headers.get('authorization');
	const password = process.env.ADMIN_PASSWORD;

	if (!password) {
		return json({ error: 'Admin password not configured' }, { status: 500 });
	}

	if (!authHeader || authHeader !== `Bearer ${password}`) {
		return json(
			{ error: 'Unauthorized. Provide Authorization header: Bearer <ADMIN_PASSWORD>' },
			{ status: 401 }
		);
	}

	try {
		const dbPath = getDatabasePath();

		// Check for force parameter in query string or header
		const url = new URL(request.url);
		const force = url.searchParams.get('force') === 'true' || request.headers.get('x-force-overwrite') === 'true';

		// Safety check: if database already exists, refuse to overwrite unless forced
		if (existsSync(dbPath)) {
			if (force) {
				console.log('[API] Force overwrite requested, deleting existing database...');
				unlinkSync(dbPath);
				console.log('[API] Existing database deleted, proceeding with initialization...');
			} else {
				return json(
					{
						message: 'Database already exists',
						path: dbPath,
						exists: true,
						hint: 'To overwrite, add ?force=true to the URL or set x-force-overwrite: true header'
					},
					{ status: 400 }
				);
			}
		}

		// Check if request has body data
		const contentType = request.headers.get('content-type');
		let initialized = false;

		if (contentType && contentType.includes('application/json')) {
			try {
				const bodyData = await request.json();
				if (bodyData && Object.keys(bodyData).length > 0) {
					// Log what we received for verification
					console.log('[API] Received database data with keys:', Object.keys(bodyData).join(', '));
					console.log('[API] Pages:', bodyData.pages?.length || 0);
					console.log('[API] Team members:', bodyData.team?.length || 0);
					console.log('[API] Services:', bodyData.services?.length || 0);
					console.log('[API] Icons:', bodyData.icons?.length || 0);
					console.log('[API] Settings keys:', Object.keys(bodyData.settings || {}).length);
					console.log('[API] Total data size:', JSON.stringify(bodyData).length, 'bytes');
					
					// Initialize with provided data
					initialized = initializeDatabaseWithData(bodyData);
				} else {
					// Empty body, use default
					console.log('[API] Empty body received, using default database structure');
					initialized = initializeDatabase();
				}
			} catch (parseError) {
				// Invalid JSON, use default
				console.warn('[API] Failed to parse request body, using default database structure:', parseError);
				initialized = initializeDatabase();
			}
		} else {
			// No body or non-JSON, use default
			console.log('[API] No JSON body received, using default database structure');
			initialized = initializeDatabase();
		}

		if (initialized) {
			return json({
				message: 'Database initialized successfully',
				path: dbPath
			});
		} else {
			// This shouldn't happen due to safety check above, but handle it anyway
			return json({
				message: 'Database already exists',
				path: dbPath,
				exists: true
			});
		}
	} catch (error) {
		console.error('[API] Failed to initialize database:', error);
		return json({ error: error.message || 'Failed to initialize database' }, { status: 500 });
	}
}

/**
 * GET /api/init-database
 * Get database status and path (for debugging)
 * Protected by admin password authentication
 */
export async function GET({ request }) {
	const authHeader = request.headers.get('authorization');
	const password = process.env.ADMIN_PASSWORD;

	if (!password) {
		return json({ error: 'Admin password not configured' }, { status: 500 });
	}

	if (!authHeader || authHeader !== `Bearer ${password}`) {
		return json(
			{ error: 'Unauthorized. Provide Authorization header: Bearer <ADMIN_PASSWORD>' },
			{ status: 401 }
		);
	}

	try {
		const dbPath = getDatabasePath();
		const exists = existsSync(dbPath);

		return json({
			path: dbPath,
			exists,
			environment: process.env.NODE_ENV || 'development',
			databasePath: process.env.DATABASE_PATH || './data/database.json'
		});
	} catch (error) {
		console.error('[API] Failed to get database status:', error);
		return json({ error: error.message || 'Failed to get database status' }, { status: 500 });
	}
}
