import { json } from '@sveltejs/kit';
import { checkAuth } from '$lib/auth.js';
import { readDatabase } from '$lib/database.js';

/**
 * GET /api/admin/pages/[id]
 * Get a specific page
 */
export async function GET({ params, cookies }) {
	if (!checkAuth(cookies)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	
	try {
		const db = readDatabase();
		const page = db.pages.find((p) => p.id === params.id);

		if (!page) {
			return json({ error: 'Page not found' }, { status: 404 });
		}

		return json({ page });
	} catch (error) {
		console.error('[API] Error getting page:', error);
		return json({ error: error.message || 'Failed to get page' }, { status: 500 });
	}
}
