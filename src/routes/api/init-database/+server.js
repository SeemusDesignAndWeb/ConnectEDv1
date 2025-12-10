import { json } from '@sveltejs/kit';
import { existsSync } from 'fs';
import { initializeDatabase, getDatabasePath } from '$lib/database.js';

/**
 * POST /api/init-database
 * Initialize the database file with default structure
 * Protected by admin password authentication
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
		const initialized = initializeDatabase();
		const dbPath = getDatabasePath();

		if (initialized) {
			return json({
				message: 'Database initialized successfully',
				path: dbPath
			});
		} else {
			return json({
				message: 'Database already exists',
				path: dbPath
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
			environment: process.env.NODE_ENV || 'development'
		});
	} catch (error) {
		console.error('[API] Failed to get database status:', error);
		return json({ error: error.message || 'Failed to get database status' }, { status: 500 });
	}
}
